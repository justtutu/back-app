import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('book')
export class Book {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  title: string;

  @Column({ length: 255, nullable: true })
  author: string;

  @Column({ length: 32, unique: true, nullable: true })
  isbn: string;

  @Column({ length: 255, nullable: true })
  publisher: string;

  @Column({ type: 'date', nullable: true })
  publishDate: Date;

  @Column({ length: 512, nullable: true })
  coverUrl: string;

  @Column({ length: 64, nullable: true })
  category: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 16, default: '在库' })
  status: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 