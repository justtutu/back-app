import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { Book } from './book.entity';
import { faker } from '@faker-js/faker';

export class BookSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const repo = dataSource.getRepository(Book);
    // 查询 categories 表
    const categories = await dataSource.query('SELECT id, name FROM categories');
    if (!categories.length) {
      throw new Error('请先插入类别数据到 categories 表');
    }
    const books: Partial<Book>[] = [];
    for (let i = 1; i <= 100; i++) {
      const randomCategory = faker.helpers.arrayElement(categories) as { id: number, name: string };
      books.push({
        title: faker.lorem.words(3),
        author: faker.person.fullName(),
        isbn: faker.string.numeric(13),
        publisher: faker.company.name(),
        publishDate: faker.date.between({ from: '2000-01-01', to: '2024-01-01' }),
        coverUrl: faker.image.urlPicsumPhotos({ width: 200, height: 300 }),
        category: randomCategory.id.toString(), // 赋值为类别id字符串
        description: faker.lorem.paragraph(),
        status: '在库',
        price: Number(faker.commerce.price({ min: 10, max: 100 })),
      });
    }
    await repo.insert(books);
  }
} 