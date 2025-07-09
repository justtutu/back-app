import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../../user/user.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authorization = request.headers.authorization;

    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new UnauthorizedException('未提供有效的token');
    }

    const token = authorization.substring(7);
    const user = await this.userService.validateToken(token);

    if (!user) {
      throw new UnauthorizedException('token无效或已过期');
    }

    // 将用户信息添加到请求对象中
    request.user = user;
    return true;
  }
}
