import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from './email.service';
import { SendOtpDto, VerifyOtpDto, RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { CodeGeneratorUtil } from '../common/utils/code-generator.util';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
    private emailService: EmailService,
  ) {}

  /**
   * Send OTP to email for registration
   */
  async sendOtp(dto: SendOtpDto) {
    const { email } = dto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Generate OTP
    const otp = CodeGeneratorUtil.generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in database
    await this.prisma.otpVerification.upsert({
      where: { email },
      update: {
        otp,
        expiresAt,
        verified: false,
      },
      create: {
        email,
        otp,
        expiresAt,
        verified: false,
      },
    });

    // Send OTP via email
    await this.emailService.sendOTP(email, otp);

    return { message: 'OTP sent successfully to your email' };
  }

  /**
   * Verify OTP
   */
  async verifyOtp(dto: VerifyOtpDto) {
    const { email, otp } = dto;

    const otpRecord = await this.prisma.otpVerification.findUnique({
      where: { email },
    });

    if (!otpRecord) {
      throw new BadRequestException('OTP not found. Please request a new OTP');
    }

    if (otpRecord.verified) {
      throw new BadRequestException('OTP already verified');
    }

    if (new Date() > otpRecord.expiresAt) {
      throw new BadRequestException('OTP expired. Please request a new OTP');
    }

    if (otpRecord.otp !== otp) {
      throw new BadRequestException('Invalid OTP');
    }

    // Mark as verified
    await this.prisma.otpVerification.update({
      where: { email },
      data: { verified: true },
    });

    return { message: 'OTP verified successfully. You can now register' };
  }

  /**
   * Register a new user
   */
  async register(dto: RegisterDto) {
    const { email, password, name, familyCode, familyName } = dto;

    // Check if OTP was verified
    const otpRecord = await this.prisma.otpVerification.findUnique({
      where: { email },
    });

    if (!otpRecord || !otpRecord.verified) {
      throw new BadRequestException('Email not verified. Please verify OTP first');
    }

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    let family;

    // If familyCode provided, join existing family
    if (familyCode) {
      family = await this.prisma.family.findUnique({
        where: { familyCode },
      });

      if (!family) {
        throw new BadRequestException('Invalid family code');
      }

      // Create user as MEMBER
      const user = await this.prisma.user.create({
        data: {
          email,
          name,
          passwordHash,
          familyId: family.id,
          role: 'MEMBER',
        },
        include: { family: true },
      });

      // Clean up OTP record
      await this.prisma.otpVerification.delete({ where: { email } });

      const tokens = await this.generateTokens(user.id, user.email);

      return {
        message: 'Registration successful',
        user: this.sanitizeUser(user),
        ...tokens,
      };
    }

    // Create new family
    if (!familyName) {
      throw new BadRequestException('Family name required for new family');
    }

    const newFamilyCode = CodeGeneratorUtil.generateFamilyCode();

    family = await this.prisma.family.create({
      data: {
        familyName,
        familyCode: newFamilyCode,
      },
    });

    // Create user as ADMIN
    const user = await this.prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        familyId: family.id,
        role: 'ADMIN',
      },
      include: { family: true },
    });

    // Clean up OTP record
    await this.prisma.otpVerification.delete({ where: { email } });

    const tokens = await this.generateTokens(user.id, user.email);

    return {
      message: 'Family created and registration successful',
      user: this.sanitizeUser(user),
      familyCode: newFamilyCode,
      ...tokens,
    };
  }

  /**
   * Login user
   */
  async login(dto: LoginDto) {
    const { familyCode, email, password } = dto;

    // Find family
    const family = await this.prisma.family.findUnique({
      where: { familyCode },
    });

    if (!family) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Find user
    const user = await this.prisma.user.findFirst({
      where: {
        email,
        familyId: family.id,
      },
      include: { family: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user.id, user.email);

    return {
      message: 'Login successful',
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
      });

      // Check if refresh token exists in database
      const tokenRecord = await this.prisma.refreshToken.findUnique({
        where: { token: refreshToken },
      });

      if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }

      // Generate new access token
      const accessToken = this.jwtService.sign(
        { sub: payload.sub, email: payload.email },
        {
          secret: this.config.get('JWT_ACCESS_SECRET'),
          expiresIn: this.config.get('JWT_ACCESS_EXPIRATION'),
        },
      );

      return {
        message: 'Token refreshed successfully',
        accessToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Logout user
   */
  async logout(userId: string, refreshToken: string) {
    // Delete refresh token
    await this.prisma.refreshToken.deleteMany({
      where: {
        userId,
        token: refreshToken,
      },
    });

    return { message: 'Logged out successfully' };
  }

  /**
   * Generate JWT tokens
   */
  private async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.config.get('JWT_ACCESS_SECRET'),
      expiresIn: this.config.get('JWT_ACCESS_EXPIRATION'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.config.get('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get('JWT_REFRESH_EXPIRATION'),
    });

    // Store refresh token in database
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await this.prisma.refreshToken.create({
      data: {
        userId,
        token: refreshToken,
        expiresAt,
      },
    });

    return { accessToken, refreshToken };
  }

  /**
   * Forgot Family Code - Send family code to user's email
   */
  async forgotFamilyCode(email: string) {
    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { family: true },
    });

    if (!user) {
      throw new BadRequestException('No account found with this email');
    }

    // Send family code via email
    await this.emailService.sendFamilyCode(
      email,
      user.name,
      user.family.familyCode,
      user.family.familyName,
    );

    return { message: 'Family code sent to your email successfully' };
  }

  /**
   * Remove sensitive data from user object
   */
  private sanitizeUser(user: any) {
    const { passwordHash, ...sanitized } = user;
    return sanitized;
  }
}

