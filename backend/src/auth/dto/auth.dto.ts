import { IsEmail, IsString, MinLength } from 'class-validator';
import { UserRole } from '../../users/entities/user.entity';

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  first_name!: string;

  last_name!: string;

  phone?: string;

  role!: UserRole;
}

export class LoginResponseDto {
  accessToken!: string;
  refreshToken!: string;
  user!: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
  };
}
