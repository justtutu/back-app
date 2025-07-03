import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 添加全局拦截器 - 只保留日志拦截器
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
