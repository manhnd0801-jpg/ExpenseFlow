import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { EventStatus } from '../common/constants/enums';
import { Transaction } from './transaction.entity';
import { User } from './user.entity';

/**
 * Event Entity - Special events/projects
 * Groups transactions by events (wedding, vacation, etc.)
 */
@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  budget: number; // Total budget for the event

  @Column({ type: 'date', nullable: true })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

  @Column({ 
    type: 'smallint',
    default: EventStatus.PLANNED,
    comment: '1=Planned, 2=Active, 3=Completed, 4=Cancelled'
  })
  status: EventStatus;

  @Column({ type: 'varchar', length: 7, nullable: true })
  color: string; // Hex color for UI

  @Column({ type: 'varchar', length: 50, nullable: true })
  icon: string; // Icon name for UI

  @Column({ type: 'varchar', length: 255, nullable: true })
  location: string;

  @Column({ type: 'json', nullable: true })
  tags: string[]; // Array of tag strings

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;

  // Relationships
  @ManyToOne(() => User, user => user.events)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => Transaction, transaction => transaction.event)
  transactions: Transaction[];

  // Virtual properties
  get totalSpent(): number {
    if (!this.transactions) return 0;
    return this.transactions
      .filter(t => t.type === 2) // Expenses only
      .reduce((sum, t) => sum + Number(t.amount), 0);
  }

  get remainingBudget(): number {
    if (!this.budget) return 0;
    return Math.max(0, this.budget - this.totalSpent);
  }

  get budgetUsedPercentage(): number {
    if (!this.budget) return 0;
    return (this.totalSpent / this.budget) * 100;
  }

  get isOverBudget(): boolean {
    return this.budget ? this.totalSpent > this.budget : false;
  }

  get isActive(): boolean {
    return this.status === EventStatus.ACTIVE;
  }

  get isCompleted(): boolean {
    return this.status === EventStatus.COMPLETED;
  }
}