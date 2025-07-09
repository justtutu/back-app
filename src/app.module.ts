import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { BookModule } from './book/book.module';
import { BorrowRecordModule } from './borrow-record/borrow-record.module';
import { DictModule } from './dict/dict.module';
import { QiniuService } from './common/services/qiniu.service';
import { UploadController } from './upload.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      autoLoadEntities: true,
      synchronize: true, // 生产环境建议为 false
    }),
    UserModule,
    BookModule,
    BorrowRecordModule,
    DictModule,
  ],
  controllers: [AppController, UploadController],
  providers: [AppService, QiniuService],
})
export class AppModule {}
