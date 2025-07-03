import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtService } from '../common/services/jwt.service';
import { ResponseUtil } from '../common/utils/response.util';
import * as bcrypt from 'bcryptjs';

/**
 * 用户服务
 */
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  /** 创建用户 */
  async createUser(createUserDto: CreateUserDto): Promise<User> {
    // 加密密码
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    return this.userRepository.save(user);
  }

  /** 查询所有用户 */
  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  /** 根据ID查询用户 */
  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOneBy({ id });
  }

  /** 根据用户名查询用户 */
  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOneBy({ username });
  }

  /** 根据手机号查询用户 */
  async findByPhone(phone: string): Promise<User | null> {
    return this.userRepository.findOneBy({ phone });
  }

  /** 更新用户 */
  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User | null> {
    await this.userRepository.update(id, updateUserDto);
    return this.findById(id);
  }

  /** 删除用户 */
  async deleteUser(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }

  /** 用户注册 */
  async register(createUserDto: CreateUserDto): Promise<{ success: boolean; data: { msg: string; id?: string } }> {
    // 检查用户名或手机号是否已存在
    const exist = await this.userRepository.findOne({
      where: [
        { username: createUserDto.username },
        { phone: createUserDto.phone },
      ],
    });
    if (exist) {
      return ResponseUtil.error('用户名或手机号已存在');
    }
    
    // 加密密码
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    const saved = await this.userRepository.save(user);
    return ResponseUtil.success({ id: saved.id }, '注册成功');
  }

  /** 用户登录 */
  async login(loginUserDto: LoginUserDto): Promise<{
    success: boolean;
    data: {
      msg: string;
      token?: string;
      userInfo?: {
        id: string;
        username: string;
        phone: string;
        avatar?: string;
        role: string;
        points: number;
        createdAt: Date;
      };
    };
  }> {
    // 查找用户
    const user = await this.findByPhone(loginUserDto.phone);
    if (!user) {
      return ResponseUtil.error('手机号错误');
    }

    console.log('loginUserDto.password:', loginUserDto.password);
    console.log('user.password:', user.password);

    // 验证密码
    const isPasswordValid = await bcrypt.compare(loginUserDto.password, user.password);
    if (!isPasswordValid) {
      return ResponseUtil.error('密码错误');
    }

    // 生成token
    const token = this.jwtService.generateToken({
      id: user.id,
      username: user.username,
      role: user.role,
    });

    // 更新用户的token信息
    const tokenExpiresAt = new Date();
    tokenExpiresAt.setDate(tokenExpiresAt.getDate() + 7); // 7天后过期

    await this.userRepository.update(user.id, {
      token,
      tokenExpiresAt,
    });

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

    return ResponseUtil.loginSuccess(token, userInfo);
  }

  /** 验证token */
  async validateToken(token: string): Promise<User | null> {
    const payload = this.jwtService.verifyToken(token);
    if (!payload) {
      return null;
    }

    const user = await this.findById(payload.id);
    if (!user || user.token !== token || user.tokenExpiresAt < new Date()) {
      return null;
    }

    return user;
  }

  /** 退出登录 */
  async logout(userId: string): Promise<{ success: boolean; data: { msg: string } }> {
    await this.userRepository.update(userId, {
      token: undefined,
      tokenExpiresAt: undefined,
    });

    return ResponseUtil.success(undefined, '退出登录成功');
  }
} 