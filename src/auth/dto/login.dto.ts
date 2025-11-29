import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  familyCode: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}

