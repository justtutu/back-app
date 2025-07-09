import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dict } from './dict.entity';
import { DictService } from './dict.service';
import { DictController } from './dict.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Dict])],
  providers: [DictService],
  controllers: [DictController],
  exports: [DictService],
})
export class DictModule {}
