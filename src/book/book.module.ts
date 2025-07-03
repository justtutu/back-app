import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from './book.entity';
import { BookService } from './book.service';
import { BookController } from './book.controller';
import { BorrowRecordModule } from '../borrow-record/borrow-record.module';
import { BorrowRecord } from '../borrow-record/borrow-record.entity';
import { UserModule } from '../user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Book, BorrowRecord]), BorrowRecordModule, UserModule],
  providers: [BookService],
  controllers: [BookController],
  exports: [BookService],
})
export class BookModule {} 