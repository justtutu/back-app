import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BorrowRecord } from './borrow-record.entity';
import { BorrowRecordService } from './borrow-record.service';
import { BorrowRecordController } from './borrow-record.controller';

@Module({
  imports: [TypeOrmModule.forFeature([BorrowRecord])],
  providers: [BorrowRecordService],
  controllers: [BorrowRecordController],
  exports: [BorrowRecordService],
})
export class BorrowRecordModule {}
