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
import { GoalStatus } from '../common/constants/enums';
import { User } from './user.entity';

/**
 * Goal Entity - Financial goals
 * Tracks savings goals and progress
 */
@Entity('goals')
export class Goal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  targetAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  currentAmount: number;

  @Column({ type: 'date', nullable: true })
  targetDate: Date;

  @Column({ 
    type: 'smallint',
    default: GoalStatus.ACTIVE,
    comment: '1=Active, 2=Completed, 3=Cancelled'
  })
  status: GoalStatus;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  monthlyTarget: number; // Suggested monthly contribution

  @Column({ type: 'boolean', default: false })
  autoContribute: boolean; // Auto-contribute from income

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  autoContributePercentage: number; // Percentage of income to auto-contribute

  @Column({ type: 'varchar', length: 7, nullable: true })
  color: string; // Hex color for UI

  @Column({ type: 'varchar', length: 50, nullable: true })
  icon: string; // Icon name for UI

  @Column({ type: 'integer', default: 0 })
  priority: number; // Goal priority (1 = highest)

  @Column({ type: 'date', nullable: true })
  completedDate: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;

  // Relationships
  @ManyToOne(() => User, user => user.goals)
  @JoinColumn({ name: 'user_id' })
  user: User;

  // Virtual properties
  get remaining(): number {
    return Math.max(0, this.targetAmount - this.currentAmount);
  }

  get progressPercentage(): number {
    return this.targetAmount > 0 ? (this.currentAmount / this.targetAmount) * 100 : 0;
  }

  get isCompleted(): boolean {
    return this.currentAmount >= this.targetAmount || this.status === GoalStatus.COMPLETED;
  }

  get daysRemaining(): number | null {
    if (!this.targetDate) return null;
    const today = new Date();
    const diffTime = this.targetDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  get isOverdue(): boolean {
    if (!this.targetDate) return false;
    return new Date() > this.targetDate && !this.isCompleted;
  }

  get suggestedDailyContribution(): number {
    const days = this.daysRemaining;
    if (!days || days <= 0) return 0;
    return this.remaining / days;
  }
}