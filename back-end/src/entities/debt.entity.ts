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
import { DebtStatus, DebtType } from '../common/constants/enums';
import { DateToString, DecimalToNumber } from '../common/decorators';
import { Account } from './account.entity';
import { DebtPayment } from './debt-payment.entity';
import { Transaction } from './transaction.entity';
import { User } from './user.entity';

/**
 * Debt Entity - Debt management (lending/borrowing)
 * Tracks money lent to others or borrowed from others
 */
@Entity('debts')
export class Debt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({
    type: 'smallint',
    comment: '1=Lending, 2=Borrowing',
  })
  type: DebtType;

  @Column({ name: 'personName', type: 'varchar', length: 255 })
  personName: string; // Name of person/organization

  @Column({ name: 'contactInfo', type: 'varchar', length: 255, nullable: true })
  contactInfo: string; // Phone, email, etc.

  @DecimalToNumber()
  @Column({ name: 'originalAmount', type: 'decimal', precision: 15, scale: 2 })
  originalAmount: number;

  @DecimalToNumber()
  @Column({ name: 'remainingAmount', type: 'decimal', precision: 15, scale: 2 })
  remainingAmount: number;

  @DecimalToNumber()
  @Column({ name: 'interestRate', type: 'decimal', precision: 5, scale: 2, default: 0 })
  interestRate: number; // Annual interest rate percentage

  @DecimalToNumber()
  @Column({ name: 'totalInterestPaid', type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalInterestPaid: number; // Total interest paid so far

  @Column({ name: 'account_id', type: 'uuid', nullable: true })
  accountId?: string; // Account used for this debt (source for lending, destination for borrowing)

  @Column({ name: 'initial_transaction_id', type: 'uuid', nullable: true })
  initialTransactionId?: string; // Transaction created when debt was established

  @Column({ name: 'borrowedDate', type: 'timestamp' })
  @DateToString()
  borrowedDate: Date;

  @Column({ name: 'dueDate', type: 'timestamp', nullable: true })
  @DateToString()
  dueDate: Date;

  @Column({
    type: 'smallint',
    default: DebtStatus.ACTIVE,
    comment: '1=Active, 2=Paid, 3=Partial, 4=Overdue',
  })
  status: DebtStatus;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;

  // Relationships
  @ManyToOne(() => User, (user) => user.debts)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => DebtPayment, (payment) => payment.debt)
  payments: DebtPayment[];

  @ManyToOne(() => Account)
  @JoinColumn({ name: 'account_id' })
  account: Account;

  @ManyToOne(() => Transaction, { nullable: true })
  @JoinColumn({ name: 'initial_transaction_id' })
  initialTransaction?: Transaction;

  // Virtual properties
  get paidAmount(): number {
    return this.originalAmount - this.remainingAmount;
  }

  get progressPercentage(): number {
    return this.originalAmount > 0 ? (this.paidAmount / this.originalAmount) * 100 : 0;
  }

  get isPaid(): boolean {
    return this.remainingAmount <= 0 || this.status === DebtStatus.COMPLETED;
  }

  get isOverdue(): boolean {
    if (!this.dueDate) return false;
    return new Date() > this.dueDate && !this.isPaid;
  }

  get daysUntilDue(): number | null {
    if (!this.dueDate) return null;
    const today = new Date();
    const diffTime = this.dueDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  get isLending(): boolean {
    return this.type === DebtType.LENDING;
  }

  get isBorrowing(): boolean {
    return this.type === DebtType.BORROWING;
  }
}
