import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BookRole } from '../common/constants/enums';
import { SharedBook } from './shared-book.entity';
import { User } from './user.entity';

/**
 * SharedBookMember Entity - Members of a shared book
 */
@Entity('shared_book_members')
export class SharedBookMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'shared_book_id', type: 'uuid' })
  sharedBookId: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({
    type: 'smallint',
    default: BookRole.VIEWER,
    comment: '1=Viewer (chỉ xem), 2=Editor (chỉnh sửa), 3=Admin (quản trị)',
  })
  role: BookRole;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  acceptedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => SharedBook, (book) => book.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shared_book_id' })
  sharedBook: SharedBook;

  @ManyToOne(() => User, (user) => user.sharedBookMemberships)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
