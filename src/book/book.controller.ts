import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { BookService } from './book.service';
import { Book } from './book.entity';
import { ResponseUtil } from '../common/utils/response.util';
import { BorrowStatus } from '../common/enums';
import { BorrowRecord } from '../borrow-record/borrow-record.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('books')
export class BookController {
  constructor(private readonly bookService: BookService) {}
  @Get('home')
  async getHomeData(): Promise<any> {
    const [hotBooks, latestBooks, booksCount, categoriesCount] =
      await Promise.all([
        this.bookService.getHotBooks(),
        this.bookService.getLatestBooks(),
        this.bookService.getBooksCount(),
        this.bookService.getCategoriesCount(),
      ]);
    return ResponseUtil.success({
      hotBooks,
      latestBooks,
      booksCount,
      categoriesCount,
    });
  }

  @Get('favorites')
  @UseGuards(JwtAuthGuard)
  async getUserFavorites(@Req() req): Promise<any> {
    const userId = req.user.id;
    const result = await this.bookService.getUserFavorites(userId);
    return ResponseUtil.success(result);
  }

  @Get(':id')
  async findById(@Param('id') id: string, @Req() req): Promise<any> {
    let userId: string | undefined = undefined;
    if (req.user && req.user.id) userId = req.user.id;
    const result = await this.bookService.findById(id, userId);
    if (
      !userId &&
      result &&
      typeof result === 'object' &&
      'isFavorite' in result
    ) {
      delete result.isFavorite;
    }
    return ResponseUtil.success(result);
  }

  @Get()
  async searchBooks(
    @Query('title') title?: string,
    @Query('author') author?: string,
    @Query('isbn') isbn?: string,
    /**
     * 图书分类，对应dict表的code（type=category）
     */
    @Query('category') category?: string,
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '10',
    @Query('sortBy') sortBy?: string,
  ): Promise<any> {
    const result = await this.bookService.searchBooks({
      title,
      author,
      isbn,
      category,
      page: Number(page),
      pageSize: Number(pageSize),
      sortBy,
    });
    return ResponseUtil.success(result);
  }

  @Post()
  async create(@Body() book: Partial<Book>): Promise<any> {
    const result = await this.bookService.create(book);
    return ResponseUtil.success(result);
  }

  @Post('borrow')
  async borrowBook(
    @Body() body: { userId: string; bookId: string },
  ): Promise<any> {
    const { userId, bookId } = body;
    if (!userId || !bookId) {
      return ResponseUtil.error('参数缺失');
    }
    const result = await this.bookService.borrowBook(userId, bookId);
    if (result.success) {
      return ResponseUtil.success(result.data, '借阅成功');
    } else {
      return ResponseUtil.error(result.message || '借阅失败');
    }
  }

  @Get('borrow/records')
  @UseGuards(JwtAuthGuard)
  async getUserBorrowRecords(@Req() req): Promise<any> {
    const userId = req.user.id;
    const result = await this.bookService.getUserBorrowRecords(userId);
    return ResponseUtil.success(result);
  }

  @Post('return')
  @UseGuards(JwtAuthGuard)
  async returnBook(
    @Body() body: { recordId: string },
    @Req() req,
  ): Promise<any> {
    const userId = req.user.id;
    const { recordId } = body;
    if (!recordId) {
      return ResponseUtil.error('参数缺失');
    }
    const result = await this.bookService.returnBook(userId, recordId);
    if (result.success) {
      return ResponseUtil.success(result.data, '归还成功');
    } else {
      return ResponseUtil.error(result.message || '归还失败');
    }
  }

  @Post('favorite')
  @UseGuards(JwtAuthGuard)
  async addFavorite(@Body() body: { bookId: string }, @Req() req) {
    const userId = req.user.id;
    const { bookId } = body;
    if (!bookId) return ResponseUtil.error('参数缺失');
    const result = await this.bookService.addFavorite(userId, bookId);
    if (result.success) return ResponseUtil.success(null, '收藏成功');
    return ResponseUtil.error(result.message || '收藏失败');
  }

  @Post('unfavorite')
  @UseGuards(JwtAuthGuard)
  async removeFavorite(@Body() body: { bookId: string }, @Req() req) {
    const userId = req.user.id;
    const { bookId } = body;
    if (!bookId) return ResponseUtil.error('参数缺失');
    const result = await this.bookService.removeFavorite(userId, bookId);
    if (result.success) return ResponseUtil.success(null, '取消收藏成功');
    return ResponseUtil.error(result.message || '取消收藏失败');
  }

  @Post('admin/overview')
  async getAdminOverview(): Promise<any> {
    const result = await this.bookService.getAdminOverview();
    return ResponseUtil.success(result);
  }
}
