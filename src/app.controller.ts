import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('test')
  getTest(@Query('name') name: string, @Query('age') age: number) {
    return {
      message: '测试接口',
      data: { name, age },
      timestamp: new Date().toISOString(),
    };
  }

  @Post('user')
  createUser(@Body() userData: any) {
    return {
      message: '用户创建成功',
      data: {
        id: Math.floor(Math.random() * 1000),
        ...userData,
        createdAt: new Date().toISOString(),
      },
    };
  }

  @Get('user/:id')
  getUser(@Param('id') id: string) {
    return {
      message: '获取用户信息',
      data: {
        id,
        name: '测试用户',
        email: 'test@example.com',
        createdAt: new Date().toISOString(),
      },
    };
  }

  @Get('error-test')
  testError() {
    throw new Error('这是一个测试错误');
  }
}
