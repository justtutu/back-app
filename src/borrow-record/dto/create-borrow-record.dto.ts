import { IsInt, IsDateString, IsOptional, IsEnum, IsString } from 'class-validator';
import { BorrowStatus } from '../../common/enums';

export class CreateBorrowRecordDto {
  @IsInt()
  userId: number;

  @IsInt()
  bookId: number;

  @IsDateString()
  dueDate: string;

  @IsOptional()
  @IsDateString()
  returnDate?: string;

  @IsOptional()
  @IsEnum(BorrowStatus)
  status?: BorrowStatus;

  @IsOptional()
  @IsString()
  remark?: string;
} 