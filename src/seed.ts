import { config as dotenvConfig } from 'dotenv';
import { DataSource } from 'typeorm';
import { Book } from './book/book.entity';
import { BookSeeder } from './book/book.seeder';
import { runSeeders } from 'typeorm-extension';
import { BorrowRecord } from './borrow-record/borrow-record.entity';
import { User } from './user/user.entity';
import { BorrowRecordSeeder } from './borrow-record/borrow-record.seeder';
const path = require('path');
console.log('typeof path:', typeof path);
dotenvConfig({ path: path.resolve(__dirname, '../.env') });

const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [Book, User, BorrowRecord],
  synchronize: false,
});

AppDataSource.initialize()
  .then(async (dataSource) => {
    await runSeeders(dataSource, {
      seeds: [BookSeeder, BorrowRecordSeeder],
    });
    await dataSource.destroy();
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  }); 