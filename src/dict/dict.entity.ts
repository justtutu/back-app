import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('dict')
export class Dict {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  type: string;

  @Column({ length: 50 })
  code: string;

  @Column({ length: 50 })
  name: string;

  @Column({ default: 0 })
  sort: number;

  @Column({ length: 255, nullable: true })
  remark: string;
}
