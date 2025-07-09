import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from './book.entity';
import { BookService } from './book.service';
import { BookController } from './book.controller';
import { BorrowRecordModule } from '../borrow-record/borrow-record.module';
import { BorrowRecord } from '../borrow-record/borrow-record.entity';
import { UserModule } from '../user/user.module';
import { Favorite } from './favorite.entity';
import { QiniuService } from '../common/services/qiniu.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Book, BorrowRecord, Favorite]),
    BorrowRecordModule,
    UserModule,
  ],
  providers: [BookService, QiniuService],
  controllers: [BookController],
  exports: [BookService],
})
export class BookModule {}
