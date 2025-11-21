import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { FrequencyType, ReminderType } from '../common/constants/enums';
import { User } from './user.entity';

/**
 * Reminder Entity - Payment and custom reminders
 * Manages scheduled reminders for various purposes
 */
@Entity('reminders')
export class Reminder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'smallint',
    comment: '1=Payment, 2=Budget, 3=Goal, 4=Custom',
  })
  type: ReminderType;

  @Column({ type: 'timestamp' })
  dueDate: Date;

  @Column({
    type: 'smallint',
    default: FrequencyType.ONCE,
    comment: '1=Once, 2=Daily, 3=Weekly, 4=Monthly, 5=Quarterly, 6=Yearly',
  })
  frequency: FrequencyType;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isCompleted: boolean;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastNotifiedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  nextDueDate: Date; // For recurring reminders

  @Column({ type: 'integer', default: 1 })
  daysBefore: number; // How many days before to remind

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  amount: number; // For payment reminders

  @Column({ type: 'varchar', length: 255, nullable: true })
  category: string;

  @Column({ type: 'json', nullable: true })
  notificationSettings: Record<string, any>; // Email, push, SMS settings

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;

  // Relationships
  @ManyToOne(() => User, (user) => user.reminders)
  @JoinColumn({ name: 'user_id' })
  user: User;

  // Virtual properties
  get isDue(): boolean {
    return new Date() >= this.dueDate;
  }

  get isOverdue(): boolean {
    return new Date() > this.dueDate && !this.isCompleted;
  }

  get daysUntilDue(): number {
    const today = new Date();
    const diffTime = this.dueDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  get shouldNotify(): boolean {
    if (!this.isActive || this.isCompleted) return false;
    return this.daysUntilDue <= this.daysBefore;
  }

  get isRecurring(): boolean {
    return this.frequency !== FrequencyType.ONCE;
  }
}
