import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { Book } from './book.entity';
import { BorrowRecord } from '../borrow-record/borrow-record.entity';
import { BorrowStatus } from '../common/enums';
import { User } from '../user/user.entity';
import { Favorite } from './favorite.entity';
import { QiniuService } from '../common/services/qiniu.service';

@Injectable()
export class BookService {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    @InjectRepository(BorrowRecord)
    private readonly borrowRecordRepository: Repository<BorrowRecord>,
    @InjectRepository(Favorite)
    private readonly favoriteRepository: Repository<Favorite>,
    private readonly qiniuService: QiniuService,
  ) {}

  async create(book: Partial<Book>): Promise<Book> {
    const entity = this.bookRepository.create(book);
    return this.bookRepository.save(entity);
  }

  async findAll(): Promise<Book[]> {
    return this.bookRepository.find();
  }

  private async getCategoryMap(
    dataSource = this.bookRepository.manager,
  ): Promise<Record<string, string>> {
    const categories = await dataSource.query(
      "SELECT code as id, name FROM dict WHERE type = 'category'",
    );
    return Object.fromEntries(
      categories.map((c: any) => [c.id.toString(), c.name]),
    );
  }

  /**
   * 获取带token的coverUrl
   */
  private getCoverUrlWithToken(coverUrl: string): string {
    if (!coverUrl) return '';
    return this.qiniuService.getPrivateDownloadUrl(coverUrl);
  }

  async findById(
    id: string,
    userId?: string,
  ): Promise<
    | (Book & {
        borrowCount: number;
        availableStock: number;
        categoryName: string;
        isFavorite?: boolean;
      })
    | null
  > {
    const book = await this.bookRepository.findOneBy({ id });
    if (!book) return null;
    const borrowCount = await this.borrowRecordRepository.count({
      where: { book: { id: book.id } },
    });
    const borrowed = await this.borrowRecordRepository.count({
      where: { book: { id: book.id }, status: BorrowStatus.BORROWED },
    });
    const availableStock = 1 - borrowed;
    const categoryMap = await this.getCategoryMap();
    let isFavorite = false;
    if (userId) {
      const favorite = await this.favoriteRepository.findOne({
        where: { user: { id: userId }, book: { id: book.id } },
      });
      isFavorite = !!favorite;
    }
    const coverUrl = this.getCoverUrlWithToken(book.coverUrl);
    return {
      ...book,
      coverUrl,
      borrowCount,
      availableStock,
      categoryName: categoryMap[book.category] || '',
      isFavorite,
    };
  }

  async searchBooks(query: {
    title?: string;
    author?: string;
    isbn?: string;
    category?: string;
    page?: number;
    pageSize?: number;
    sortBy?: string;
  }): Promise<{
    data: (Book & {
      borrowCount: number;
      availableStock: number;
      categoryName: string;
    })[];
    total: number;
  }> {
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
    const bookIds = books.map((b) => b.id);
    // 批量查借阅总数
    const borrowCounts = await this.borrowRecordRepository
      .createQueryBuilder('borrow')
      .select('borrow.book_id', 'bookId')
      .addSelect('COUNT(*)', 'count')
      .where('borrow.book_id IN (:...bookIds)', { bookIds })
      .groupBy('borrow.book_id')
      .getRawMany();
    // 批量查在借数量
    const borrowedCounts = await this.borrowRecordRepository
      .createQueryBuilder('borrow')
      .select('borrow.book_id', 'bookId')
      .addSelect('COUNT(*)', 'count')
      .where('borrow.book_id IN (:...bookIds)', { bookIds })
      .andWhere('borrow.status = :status', { status: BorrowStatus.BORROWED })
      .groupBy('borrow.book_id')
      .getRawMany();
    const borrowCountMap = Object.fromEntries(
      borrowCounts.map((b) => [b.bookId, Number(b.count)]),
    );
    const borrowedCountMap = Object.fromEntries(
      borrowedCounts.map((b) => [b.bookId, Number(b.count)]),
    );
    const categoryMap = await this.getCategoryMap();
    const data = await Promise.all(
      books.map(async (book) => ({
        ...book,
        coverUrl: this.getCoverUrlWithToken(book.coverUrl),
        borrowCount: borrowCountMap[book.id] || 0,
        availableStock: 1 - (borrowedCountMap[book.id] || 0),
        categoryName: categoryMap[book.category] || '',
      })),
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
      where: { id: In(bookIds) },
    });
    // 合并借阅次数
    return books.map((book) => ({
      ...book,
      coverUrl: this.getCoverUrlWithToken(book.coverUrl),
      borrowCount: Number(
        borrowCounts.find((b) => b.bookId == book.id)?.count || 0,
      ),
    }));
  }

  /**
   * 查询最新上架的5本书，按createdAt倒序
   */
  async getLatestBooks(): Promise<Book[]> {
    const books = await this.bookRepository.find({
      order: { createdAt: 'DESC' },
      take: 5,
    });
    return books.map((book) => ({
      ...book,
      coverUrl: this.getCoverUrlWithToken(book.coverUrl),
    }));
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
    const categories = await this.bookRepository.manager.query(
      "SELECT COUNT(*) as count FROM dict WHERE type = 'category'",
    );
    return Number(categories[0]?.count || 0);
  }

  /**
   * 借阅图书
   */
  async borrowBook(
    userId: string,
    bookId: string,
  ): Promise<{ success: boolean; data?: any; message?: string }> {
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
    // 新增：借阅后将图书状态改为"借出"
    book.status = '借出';
    await this.bookRepository.save(book);
    return {
      success: true,
      data: {
        borrowId: record.id,
        bookId,
        userId,
        borrowDate: record.borrowDate,
        dueDate: record.dueDate,
      },
    };
  }

  async getUserBorrowRecords(userId: string) {
    const records = await this.borrowRecordRepository.find({
      where: { user: { id: userId } },
      relations: ['book'],
      order: { borrowDate: 'DESC' },
    });
    const current = records
      .filter((r) => r.status === BorrowStatus.BORROWED)
      .map((r) => ({
        id: r.id,
        bookId: r.book.id,
        title: r.book.title,
        author: r.book.author,
        coverUrl: this.getCoverUrlWithToken(r.book.coverUrl),
        borrowDate: r.borrowDate,
        dueDate: r.dueDate,
        status: r.status,
      }));
    const history = records
      .filter((r) => r.status === BorrowStatus.RETURNED)
      .map((r) => ({
        id: r.id,
        bookId: r.book.id,
        title: r.book.title,
        author: r.book.author,
        coverUrl: this.getCoverUrlWithToken(r.book.coverUrl),
        borrowDate: r.borrowDate,
        dueDate: r.dueDate,
        returnDate: r.returnDate,
        status: r.status,
      }));
    return { current, history };
  }

  /**
   * 归还图书
   */
  async returnBook(
    userId: string,
    recordId: string,
  ): Promise<{ success: boolean; data?: any; message?: string }> {
    // 查找该用户的未归还借阅记录
    const record = await this.borrowRecordRepository.findOne({
      where: {
        id: Number(recordId),
        user: { id: userId },
        status: BorrowStatus.BORROWED,
      },
      relations: ['book', 'user'],
    });
    if (!record) {
      return { success: false, message: '未找到可归还的借阅记录' };
    }
    record.status = BorrowStatus.RETURNED;
    record.returnDate = new Date();
    await this.borrowRecordRepository.save(record);
    // 新增：归还后将图书状态改为"在库"
    if (record.book) {
      record.book.status = '在库';
      await this.bookRepository.save(record.book);
    }
    return {
      success: true,
      data: {
        recordId: record.id,
        bookId: record.book.id,
        userId: record.user.id,
        returnDate: record.returnDate,
      },
    };
  }

  /**
   * 收藏图书
   */
  async addFavorite(userId: string, bookId: string) {
    // 检查是否已收藏
    const exist = await this.favoriteRepository.findOne({
      where: { user: { id: userId }, book: { id: bookId } },
    });
    if (exist) return { success: false, message: '已收藏' };
    const userRepo = this.bookRepository.manager.getRepository(User);
    const user = await userRepo.findOneBy({ id: userId });
    if (!user) return { success: false, message: '用户不存在' };
    const book = await this.bookRepository.findOneBy({ id: bookId });
    if (!book) return { success: false, message: '图书不存在' };
    const favorite = this.favoriteRepository.create({ user, book });
    await this.favoriteRepository.save(favorite);
    return { success: true };
  }

  /**
   * 取消收藏
   */
  async removeFavorite(userId: string, bookId: string) {
    const exist = await this.favoriteRepository.findOne({
      where: { user: { id: userId }, book: { id: bookId } },
    });
    if (!exist) return { success: false, message: '未收藏' };
    await this.favoriteRepository.remove(exist);
    return { success: true };
  }

  /**
   * 获取用户收藏的所有书籍
   */
  async getUserFavorites(userId: string): Promise<Book[]> {
    const favorites = await this.favoriteRepository.find({
      where: { user: { id: userId } },
      relations: ['book'],
      order: { createdAt: 'DESC' },
    });
    const books = favorites.map((fav) => {
      const book = fav.book;
      return { ...book, coverUrl: this.getCoverUrlWithToken(book.coverUrl) };
    });
    return books;
  }

  /**
   * 后台首页统计数据
   */
  async getAdminOverview() {
    // 日期处理
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // 并发执行所有统计和聚合查询
    const [
      totalBooks,
      availableBooks,
      borrowedBooks,
      todayBorrows,
      recentBorrows,
      hotBooksRaw,
    ] = await Promise.all([
      this.bookRepository.count(),
      this.bookRepository.count({ where: { status: '在库' } }),
      this.bookRepository.count({ where: { status: '借出' } }),
      this.borrowRecordRepository
        .createQueryBuilder('record')
        .where('record.borrowDate >= :today', { today })
        .andWhere('record.borrowDate < :tomorrow', { tomorrow })
        .getCount(),
      this.borrowRecordRepository
        .createQueryBuilder('record')
        .leftJoinAndSelect('record.book', 'book')
        .orderBy('record.borrowDate', 'DESC')
        .limit(3)
        .getMany(),
      this.borrowRecordRepository
        .createQueryBuilder('record')
        .leftJoin('record.book', 'book')
        .select([
          'record.book_id as bookId',
          'COUNT(*) as borrowCount',
          'book.title as title',
          'book.author as author',
        ])
        .groupBy('record.book_id')
        .addGroupBy('book.title')
        .addGroupBy('book.author')
        .orderBy('borrowCount', 'DESC')
        .limit(5)
        .getRawMany(),
    ]);

    // 组装 recentBorrows
    const recentBorrowList = recentBorrows.map((r) => ({
      bookName: r.book?.title || '',
      author: r.book?.author || '',
      borrowTime: r.borrowDate,
      status: r.status,
    }));

    // 组装 hotBooks
    const hotBooks = hotBooksRaw.map((hot) => ({
      bookName: hot.title || '',
      author: hot.author || '',
      borrowCount: Number(hot.borrowCount),
    }));

    return {
      stats: {
        totalBooks,
        availableBooks,
        borrowedBooks,
        todayBorrows,
      },
      recentBorrows: recentBorrowList,
      hotBooks,
    };
  }
}
