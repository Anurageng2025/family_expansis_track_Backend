import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class SendOtpDto {
  @IsEmail()
  email: string;
}

export class VerifyOtpDto {
  @IsEmail()
  email: string;

  @IsString()
  otp: string;
}

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  familyCode?: string; // Optional: if joining existing family

  @IsOptional()
  @IsString()
  familyName?: string; // Required if creating new family
}

