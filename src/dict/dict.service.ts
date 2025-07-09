import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dict } from './dict.entity';

@Injectable()
export class DictService {
  constructor(
    @InjectRepository(Dict)
    private readonly dictRepository: Repository<Dict>,
  ) {}

  async findAll(type?: string): Promise<Dict[]> {
    if (type) {
      return this.dictRepository.find({
        where: { type },
        order: { sort: 'ASC' },
      });
    }
    return this.dictRepository.find({ order: { type: 'ASC', sort: 'ASC' } });
  }

  async create(dict: Partial<Dict>): Promise<Dict> {
    const entity = this.dictRepository.create(dict);
    return this.dictRepository.save(entity);
  }

  async update(id: number, dict: Partial<Dict>): Promise<Dict | null> {
    await this.dictRepository.update(id, dict);
    return this.dictRepository.findOneBy({ id });
  }

  async remove(id: number): Promise<void> {
    await this.dictRepository.delete(id);
  }
}
