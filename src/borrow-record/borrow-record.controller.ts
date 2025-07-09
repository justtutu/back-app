import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { BorrowRecordService } from './borrow-record.service';
import { CreateBorrowRecordDto } from './dto/create-borrow-record.dto';
import { UpdateBorrowRecordDto } from './dto/update-borrow-record.dto';

@Controller('borrow-records')
export class BorrowRecordController {
  constructor(private readonly borrowRecordService: BorrowRecordService) {}

  @Post()
  create(@Body() createDto: CreateBorrowRecordDto) {
    return this.borrowRecordService.create(createDto);
  }

  @Get()
  findAll() {
    return this.borrowRecordService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.borrowRecordService.findOne(Number(id));
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateBorrowRecordDto) {
    return this.borrowRecordService.update(Number(id), updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.borrowRecordService.remove(Number(id));
  }
}
