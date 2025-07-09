import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { jwtConfig } from '../config/jwt.config';

@Injectable()
export class JwtService {
  constructor(private readonly jwtService: NestJwtService) {}

  /**
   * 生成JWT token
   */
  generateToken(payload: any): string {
    return this.jwtService.sign(payload, {
      secret: jwtConfig.secret,
      expiresIn: jwtConfig.expiresIn,
    });
  }

  /**
   * 验证JWT token
   */
  verifyToken(token: string): any {
    try {
      return this.jwtService.verify(token, {
        secret: jwtConfig.secret,
      });
    } catch (error) {
      return null;
    }
  }
}
