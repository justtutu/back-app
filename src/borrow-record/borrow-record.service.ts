import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BorrowRecord } from './borrow-record.entity';
import { CreateBorrowRecordDto } from './dto/create-borrow-record.dto';
import { UpdateBorrowRecordDto } from './dto/update-borrow-record.dto';

@Injectable()
export class BorrowRecordService {
  constructor(
    @InjectRepository(BorrowRecord)
    private readonly borrowRecordRepository: Repository<BorrowRecord>,
  ) {}

  create(createDto: CreateBorrowRecordDto) {
    const record = this.borrowRecordRepository.create(createDto);
    return this.borrowRecordRepository.save(record);
  }

  findAll() {
    return this.borrowRecordRepository.find({ relations: ['user', 'book'] });
  }

  findOne(id: number) {
    return this.borrowRecordRepository.findOne({ where: { id }, relations: ['user', 'book'] });
  }

  update(id: number, updateDto: UpdateBorrowRecordDto) {
    return this.borrowRecordRepository.update(id, updateDto);
  }

  remove(id: number) {
    return this.borrowRecordRepository.delete(id);
  }
} 