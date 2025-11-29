import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { DecimalToNumber } from '../common/decorators';
import { Account } from './account.entity';
import { Goal } from './goal.entity';
import { Transaction } from './transaction.entity';

/**
 * GoalTransaction Entity - Tracks goal contributions and withdrawals
 * Links transactions to goals for audit trail
 */
@Entity('goal_transactions')
export class GoalTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'goal_id', type: 'uuid' })
  goalId: string;

  @Column({ name: 'account_id', type: 'uuid' })
  accountId: string;

  @Column({ name: 'transaction_id', type: 'uuid', nullable: true })
  transactionId?: string; // Link to main transaction

  @DecimalToNumber()
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({
    type: 'varchar',
    length: 50,
    comment: 'CONTRIBUTION or WITHDRAWAL',
  })
  type: 'CONTRIBUTION' | 'WITHDRAWAL';

  @Column({ type: 'text', nullable: true })
  note: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relationships
  @ManyToOne(() => Goal)
  @JoinColumn({ name: 'goal_id' })
  goal: Goal;

  @ManyToOne(() => Account)
  @JoinColumn({ name: 'account_id' })
  account: Account;

  @ManyToOne(() => Transaction, { nullable: true })
  @JoinColumn({ name: 'transaction_id' })
  transaction?: Transaction;
}
