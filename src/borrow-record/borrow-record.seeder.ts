import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { BorrowRecord } from './borrow-record.entity';
import { User } from '../user/user.entity';
import { Book } from '../book/book.entity';
import { BorrowStatus } from '../common/enums';
import { faker } from '@faker-js/faker';

export class BorrowRecordSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const borrowRepo = dataSource.getRepository(BorrowRecord);
    const userRepo = dataSource.getRepository(User);
    const bookRepo = dataSource.getRepository(Book);

    const users = await userRepo.find();
    const books = await bookRepo.find();
    if (users.length === 0 || books.length === 0) {
      console.log('用户或图书数据为空，无法生成借阅记录');
      return;
    }
    const statusArr = [
      BorrowStatus.BORROWED,
      BorrowStatus.RETURNED,
      BorrowStatus.OVERDUE,
    ];
    const records: Partial<BorrowRecord>[] = [];
    for (let i = 0; i < 50; i++) {
      const user = faker.helpers.arrayElement(users);
      const book = faker.helpers.arrayElement(books);
      const borrowDate = faker.date.between({
        from: '2023-01-01',
        to: '2024-06-01',
      });
      const dueDate = faker.date.soon({ days: 30, refDate: borrowDate });
      let returnDate: Date | null = null;
      const status = faker.helpers.arrayElement(statusArr);
      if (status === BorrowStatus.RETURNED) {
        returnDate = faker.date.between({ from: borrowDate, to: dueDate });
      } else if (status === BorrowStatus.OVERDUE) {
        returnDate = null;
      } else {
        returnDate = null;
      }
      records.push({
        user,
        book,
        borrowDate,
        dueDate,
        returnDate: returnDate || undefined,
        status,
        remark: faker.lorem.sentence(),
      });
    }
    await borrowRepo.insert(records);
    console.log('已插入50条测试借阅记录');
  }
}
