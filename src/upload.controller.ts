import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { QiniuService } from './common/services/qiniu.service';
import type { Express } from 'express';

@Controller('upload')
export class UploadController {
  constructor(private readonly qiniuService: QiniuService) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: any) {
    const ext = file.originalname.split('.').pop();
    const key = `covers/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const url = await this.qiniuService.uploadFile(file.buffer, key);
    return {
      code: 0,
      msg: '上传成功',
      data: { url },
    };
  }
}
