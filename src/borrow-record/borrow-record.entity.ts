import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../user/user.entity';
import { Book } from '../book/book.entity';
import { BorrowStatus } from '../common/enums';

@Entity('borrow_record')
export class BorrowRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Book)
  @JoinColumn({ name: 'book_id' })
  book: Book;

  @CreateDateColumn({ name: 'borrow_date' })
  borrowDate: Date;

  @Column({ name: 'due_date', type: 'timestamp' })
  dueDate: Date;

  @Column({ name: 'return_date', type: 'timestamp', nullable: true })
  returnDate?: Date;

  @Column({ type: 'enum', enum: BorrowStatus, default: BorrowStatus.BORROWED })
  status: BorrowStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  remark?: string;
} 