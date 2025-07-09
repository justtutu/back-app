import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

/**
 * 创建用户 DTO
 */
export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsOptional()
  avatar?: string;
}
