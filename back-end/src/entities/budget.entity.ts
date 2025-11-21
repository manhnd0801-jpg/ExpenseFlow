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
import { BudgetPeriod } from '../common/constants/enums';
import { Category } from './category.entity';
import { User } from './user.entity';

/**
 * Budget Entity - Budget management
 * Tracks spending limits for categories and time periods
 */
@Entity('budgets')
export class Budget {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'category_id', type: 'uuid', nullable: true })
  categoryId?: string; // null for overall budget

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number; // Budget limit amount

  @Column({ 
    type: 'smallint',
    comment: '1=Daily, 2=Weekly, 3=Monthly, 4=Quarterly, 5=Yearly, 6=Custom'
  })
  period: BudgetPeriod;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  spent: number; // Current spent amount

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: true })
  alertEnabled: boolean;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 80 })
  alertThreshold: number; // Alert when spent reaches this percentage

  @Column({ type: 'boolean', default: false })
  rolloverUnused: boolean; // Roll over unused budget to next period

  @Column({ type: 'text', nullable: true })
  note: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;

  // Relationships
  @ManyToOne(() => User, user => user.budgets)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Category, category => category.budgets, { nullable: true })
  @JoinColumn({ name: 'category_id' })
  category?: Category;

  // Virtual properties
  get remaining(): number {
    return Math.max(0, this.amount - this.spent);
  }

  get spentPercentage(): number {
    return this.amount > 0 ? (this.spent / this.amount) * 100 : 0;
  }

  get isOverBudget(): boolean {
    return this.spent > this.amount;
  }

  get shouldAlert(): boolean {
    return this.alertEnabled && this.spentPercentage >= this.alertThreshold;
  }

  get isExpired(): boolean {
    return new Date() > this.endDate;
  }
}