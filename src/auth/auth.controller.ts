import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SendOtpDto, VerifyOtpDto, RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { ResponseUtil } from '../common/interfaces/api-response.interface';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * POST /api/auth/send-otp
   * Send OTP to email for registration
   */
  @Post('send-otp')
  async sendOtp(@Body() dto: SendOtpDto) {
    try {
      const result = await this.authService.sendOtp(dto);
      return ResponseUtil.success(result.message);
    } catch (error) {
      return ResponseUtil.error(error.message, error.stack, error.status);
    }
  }

  /**
   * POST /api/auth/verify-otp
   * Verify OTP
   */
  @Post('verify-otp')
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    try {
      const result = await this.authService.verifyOtp(dto);
      return ResponseUtil.success(result.message);
    } catch (error) {
      return ResponseUtil.error(error.message, error.stack, error.status);
    }
  }

  /**
   * POST /api/auth/register
   * Register new user
   */
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    try {
      const result = await this.authService.register(dto);
      return ResponseUtil.success('Registration successful', result);
    } catch (error) {
      return ResponseUtil.error(error.message, error.stack, error.status);
    }
  }

  /**
   * POST /api/auth/login
   * Login with Family ID + Email + Password
   */
  @Post('login')
  async login(@Body() dto: LoginDto) {
    try {
      const result = await this.authService.login(dto);
      return ResponseUtil.success('Login successful', result);
    } catch (error) {
      return ResponseUtil.error(error.message, error.stack, error.status);
    }
  }

  /**
   * POST /api/auth/refresh
   * Refresh access token
   */
  @Post('refresh')
  async refreshToken(@Body() dto: RefreshTokenDto) {
    try {
      const result = await this.authService.refreshToken(dto.refreshToken);
      return ResponseUtil.success('Token refreshed', result);
    } catch (error) {
      return ResponseUtil.error(error.message, error.stack, error.status);
    }
  }

  /**
   * POST /api/auth/logout
   * Logout user
   */
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@CurrentUser() user, @Body() dto: RefreshTokenDto) {
    try {
      const result = await this.authService.logout(user.userId, dto.refreshToken);
      return ResponseUtil.success(result.message);
    } catch (error) {
      return ResponseUtil.error(error.message, error.stack, error.status);
    }
  }

  /**
   * POST /api/auth/forgot-family-code
   * Send family code to user's email
   */
  @Post('forgot-family-code')
  async forgotFamilyCode(@Body() dto: SendOtpDto) {
    try {
      const result = await this.authService.forgotFamilyCode(dto.email);
      return ResponseUtil.success(result.message);
    } catch (error) {
      return ResponseUtil.error(error.message, error.stack, error.status);
    }
  }
}

