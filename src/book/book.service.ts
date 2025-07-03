import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { Book } from './book.entity';
import { BorrowRecord } from '../borrow-record/borrow-record.entity';
import { BorrowStatus } from '../common/enums';
import { User } from '../user/user.entity';

@Injectable()
export class BookService {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    @InjectRepository(BorrowRecord)
    private readonly borrowRecordRepository: Repository<BorrowRecord>,
  ) {}

  async create(book: Partial<Book>): Promise<Book> {
    const entity = this.bookRepository.create(book);
    return this.bookRepository.save(entity);
  }

  async findAll(): Promise<Book[]> {
    return this.bookRepository.find();
  }

  private async getCategoryMap(dataSource = this.bookRepository.manager): Promise<Record<string, string>> {
    const categories = await dataSource.query('SELECT id, name FROM categories');
    return Object.fromEntries(categories.map((c: any) => [c.id.toString(), c.name]));
  }

  async findById(id: string): Promise<(Book & { borrowCount: number; availableStock: number; categoryName: string }) | null> {
    const book = await this.bookRepository.findOneBy({ id });
    if (!book) return null;
    const borrowCount = await this.borrowRecordRepository.count({ where: { book: { id: book.id } } });
    const borrowed = await this.borrowRecordRepository.count({ where: { book: { id: book.id }, status: BorrowStatus.BORROWED } });
    const availableStock = 1 - borrowed;
    const categoryMap = await this.getCategoryMap();
    return { ...book, borrowCount, availableStock, categoryName: categoryMap[book.category] || '' };
  }

  async searchBooks(query: {
    title?: string;
    author?: string;
    isbn?: string;
    category?: string;
    page?: number;
    pageSize?: number;
    sortBy?: string;
  }): Promise<{ data: (Book & { borrowCount: number; availableStock: number; categoryName: string })[]; total: number }> {
    const { page = 1, pageSize = 10, sortBy, ...rest } = query;
    const where: any = {};
    if (rest.title) where.title = Like(`%${rest.title}%`);
    if (rest.author) where.author = Like(`%${rest.author}%`);
    if (rest.isbn) where.isbn = rest.isbn;
    if (rest.category) where.category = rest.category;
    const order: any = {};
    if (sortBy) {
      order[sortBy] = 'ASC';
    }
    const [books, total] = await this.bookRepository.findAndCount({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      order,
    });
    const categoryMap = await this.getCategoryMap();
    // 统计每本书的借阅次数和库存量
    const data = await Promise.all(
      books.map(async (book) => {
        const borrowCount = await this.borrowRecordRepository.count({ where: { book: { id: book.id } } });
        const borrowed = await this.borrowRecordRepository.count({ where: { book: { id: book.id }, status: BorrowStatus.BORROWED } });
        const availableStock = 1 - borrowed;
        return { ...book, borrowCount, availableStock, categoryName: categoryMap[book.category] || '' };
      })
    );
    return { data, total };
  }

  /**
   * 查询热门图书，按借阅次数降序排列，返回前10本
   */
  async getHotBooks(): Promise<(Book & { borrowCount: number })[]> {
    // 查询所有图书id及借阅次数
    const borrowCounts = await this.borrowRecordRepository
      .createQueryBuilder('borrow')
      .select('borrow.book_id', 'bookId')
      .addSelect('COUNT(*)', 'count')
      .groupBy('borrow.book_id')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    if (!borrowCounts.length) return [];
    // 获取对应的图书信息
    const bookIds = borrowCounts.map((item) => item.bookId);
    const books = await this.bookRepository.find({
      where: { id: In(bookIds) }
    });
    // 合并借阅次数
    return books.map((book) => ({
      ...book,
      borrowCount: Number(borrowCounts.find((b) => b.bookId == book.id)?.count || 0),
    }));
  }

  /**
   * 查询最新上架的5本书，按createdAt倒序
   */
  async getLatestBooks(): Promise<Book[]> {
    return this.bookRepository.find({
      order: { createdAt: 'DESC' },
      take: 5,
    });
  }

  /**
   * 获取图书总数
   */
  async getBooksCount(): Promise<number> {
    return this.bookRepository.count();
  }

  /**
   * 获取分类总数
   */
  async getCategoriesCount(): Promise<number> {
    const categories = await this.bookRepository.manager.query('SELECT COUNT(*) as count FROM categories');
    return Number(categories[0]?.count || 0);
  }

  /**
   * 借阅图书
   */
  async borrowBook(userId: string, bookId: string): Promise<{ success: boolean; data?: any; message?: string }> {
    // 检查图书是否存在
    const book = await this.bookRepository.findOneBy({ id: bookId });
    if (!book) {
      return { success: false, message: '图书不存在' };
    }
    // 检查用户是否存在
    const userRepo = this.bookRepository.manager.getRepository(User);
    const user = await userRepo.findOneBy({ id: userId });
    if (!user) {
      return { success: false, message: '用户不存在' };
    }
    // 检查是否已借未还
    const exist = await this.borrowRecordRepository.findOne({
      where: {
        user: { id: userId },
        book: { id: bookId },
        status: BorrowStatus.BORROWED,
      },
    });
    if (exist) {
      return { success: false, message: '您已借阅该书，尚未归还' };
    }
    // 检查库存
    const borrowedCount = await this.borrowRecordRepository.count({
      where: { book: { id: bookId }, status: BorrowStatus.BORROWED },
    });
    // 假设每本书只有一本库存（如有 totalStock 字段可改为 book.totalStock）
    const totalStock = 1;
    if (borrowedCount >= totalStock) {
      return { success: false, message: '库存不足' };
    }
    // 创建借阅记录
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30); // 默认30天后到期
    const record = this.borrowRecordRepository.create({
      user,
      book,
      dueDate,
      status: BorrowStatus.BORROWED,
    });
    await this.borrowRecordRepository.save(record);
    return { success: true, data: { borrowId: record.id, bookId, userId, borrowDate: record.borrowDate, dueDate: record.dueDate } };
  }

  async getUserBorrowRecords(userId: string) {
    const records = await this.borrowRecordRepository.find({
      where: { user: { id: userId } },
      relations: ['book'],
      order: { borrowDate: 'DESC' },
    });
    const current = records.filter(r => r.status === BorrowStatus.BORROWED).map(r => ({
      id: r.id,
      bookId: r.book.id,
      title: r.book.title,
      author: r.book.author,
      coverUrl: r.book.coverUrl,
      borrowDate: r.borrowDate,
      dueDate: r.dueDate,
      status: r.status,
    }));
    const history = records.filter(r => r.status === BorrowStatus.RETURNED).map(r => ({
      id: r.id,
      bookId: r.book.id,
      title: r.book.title,
      author: r.book.author,
      coverUrl: r.book.coverUrl,
      borrowDate: r.borrowDate,
      dueDate: r.dueDate,
      returnDate: r.returnDate,
      status: r.status,
    }));
    return { current, history };
  }
} 