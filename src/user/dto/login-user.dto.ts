import { IsString, IsNotEmpty } from 'class-validator';

/**
 * 用户登录 DTO
 */
export class LoginUserDto {
  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  password: string;
} 