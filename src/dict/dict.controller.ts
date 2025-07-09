import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { DictService } from './dict.service';
import { Dict } from './dict.entity';
import { ResponseUtil } from '../common/utils/response.util';

@Controller('dict')
export class DictController {
  constructor(private readonly dictService: DictService) {}

  @Get()
  async findAll(@Query('type') type?: string): Promise<Dict[]> {
    return this.dictService.findAll(type);
  }

  @Post()
  async create(@Body() dict: Partial<Dict>): Promise<Dict> {
    return this.dictService.create(dict);
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() dict: Partial<Dict>,
  ): Promise<Dict | null> {
    return this.dictService.update(id, dict);
  }

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<void> {
    return this.dictService.remove(id);
  }

  @Post('list')
  async findByType(@Body() body: { type: string }) {
    const result = await this.dictService.findAll(body.type);
    return ResponseUtil.success(result);
  }
}
