import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { Book } from './book.entity';
import { faker } from '@faker-js/faker';

export class BookSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const repo = dataSource.getRepository(Book);
    // 查询 dict 表，type='category'
    type Category = { id: string | number; name: string };
    const categories = await dataSource.query(
      "SELECT code as id, name FROM dict WHERE type = 'category'",
    ) as Category[];
    if (!categories.length) {
      throw new Error('请先插入类别数据到 dict 表，type=category');
    }
    const books: Partial<Book>[] = [];
    for (let i = 1; i <= 100; i++) {
      const randomCategory = faker.helpers.arrayElement(categories) as Category;
      const coverUrls = [
        'http://syutfaov8.hn-bkt.clouddn.com/2.png',
        'http://syutfaov8.hn-bkt.clouddn.com/3.png',
        'http://syutfaov8.hn-bkt.clouddn.com/5.png',
        'http://syutfaov8.hn-bkt.clouddn.com/622ddd17gy1huyf9lzn6nj21om23r7wh.jpg',
        'http://syutfaov8.hn-bkt.clouddn.com/73ee8a9aly1hvq4s7a0j5j20xc1e07ei.jpg',
        'http://syutfaov8.hn-bkt.clouddn.com/f2e99388b424789538f964665795402f.jpg',
        'http://syutfaov8.hn-bkt.clouddn.com/u%3D3940083963%2C3004911585%26fm%3D253%26fmt%3Dauto%26app%3D138%26f%3DJPEG.webp',
        'http://syutfaov8.hn-bkt.clouddn.com/u%3D485849382%2C3147372945%26fm%3D253%26app%3D138%26f%3DJPEG.jpg',
        'http://syutfaov8.hn-bkt.clouddn.com/u%3D993180363%2C3262683390%26fm%3D253%26app%3D138%26f%3DJPEG.jpg',
      ];
      books.push({
        title: faker.lorem.words(3),
        author: faker.person.fullName(),
        isbn: faker.string.numeric(13),
        publisher: faker.company.name(),
        publishDate: faker.date.between({
          from: '2000-01-01',
          to: '2024-01-01',
        }),
        coverUrl: faker.helpers.arrayElement(coverUrls),
        category: randomCategory.id.toString(), // 赋值为类别id字符串
        description: faker.lorem.paragraph(),
        status: '在库',
        price: Number(faker.commerce.price({ min: 10, max: 100 })),
      });
    }
    await repo.insert(books);
  }
}
