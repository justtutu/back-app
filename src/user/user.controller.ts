import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ResponseUtil } from '../common/utils/response.util';
import { User } from './user.entity';

/**
 * 用户控制器
 */
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /** 创建用户 */
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  /** 查询所有用户 */
  @Get()
  findAll() {
    return this.userService.findAll();
  }

  /** 根据ID查询用户 */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  /** 更新用户 */
  @Put(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.updateUser(id, updateUserDto);
  }

  /** 删除用户 */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.deleteUser(id);
  }

  /** 用户注册 */
  @Post('register')
  register(@Body() createUserDto: CreateUserDto) {
    console.log('register');
    return this.userService.register(createUserDto);
  }

  /** 用户登录 */
  @Post('login')
  login(@Body() loginUserDto: LoginUserDto) {
    console.log('login');
    return this.userService.login(loginUserDto);
  }

  /** 退出登录 */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  logout(@CurrentUser() user: User) {
    return this.userService.logout(user.id);
  }

  /** 获取当前用户信息 */
  @Get('profile/me')
  @UseGuards(JwtAuthGuard)
  getProfile(@CurrentUser() user: User) {
    // 返回用户信息（不包含密码和token）
    const userInfo = {
      id: user.id,
      username: user.username,
      phone: user.phone,
      avatar: user.avatar,
      role: user.role,
      points: user.points,
      createdAt: user.createdAt,
    };

    return ResponseUtil.success(userInfo, '获取用户信息成功');
  }
}
