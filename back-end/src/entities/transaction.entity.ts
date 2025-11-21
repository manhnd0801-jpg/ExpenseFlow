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
import { TransactionType } from '../common/constants/enums';
import { Account } from './account.entity';
import { Category } from './category.entity';
import { Event } from './event.entity';
import { User } from './user.entity';

/**
 * Transaction Entity - Financial transactions
 * Records all income, expense, and transfer transactions
 */
@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'account_id', type: 'uuid' })
  accountId: string;

  @Column({ name: 'to_account_id', type: 'uuid', nullable: true })
  toAccountId?: string; // For transfer transactions

  @Column({ name: 'category_id', type: 'uuid', nullable: true })
  categoryId?: string;

  @Column({ name: 'event_id', type: 'uuid', nullable: true })
  eventId?: string;

  @Column({ 
    type: 'smallint',
    comment: '1=Income, 2=Expense, 3=Transfer'
  })
  type: TransactionType;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  note: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  receiptImage: string; // Path to uploaded receipt image

  @Column({ type: 'varchar', length: 255, nullable: true })
  location: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  reference: string; // Reference number or ID

  @Column({ type: 'json', nullable: true })
  tags: string[]; // Array of tag strings

  @Column({ type: 'boolean', default: false })
  isRecurring: boolean;

  @Column({ name: 'recurring_id', type: 'uuid', nullable: true })
  recurringId?: string; // Link to recurring transaction template

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  exchangeRate: number; // For multi-currency transactions

  @Column({ type: 'varchar', length: 3, nullable: true })
  originalCurrency: string; // Original currency code

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  originalAmount: number; // Original amount before conversion

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;

  // Relationships
  @ManyToOne(() => User, user => user.transactions)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Account, account => account.transactions)
  @JoinColumn({ name: 'account_id' })
  account: Account;

  @ManyToOne(() => Account, account => account.transfersTo, { nullable: true })
  @JoinColumn({ name: 'to_account_id' })
  toAccount?: Account;

  @ManyToOne(() => Category, category => category.transactions, { nullable: true })
  @JoinColumn({ name: 'category_id' })
  category?: Category;

  @ManyToOne(() => Event, event => event.transactions, { nullable: true })
  @JoinColumn({ name: 'event_id' })
  event?: Event;

  // Virtual properties
  get isTransfer(): boolean {
    return this.type === TransactionType.TRANSFER;
  }

  get isIncome(): boolean {
    return this.type === TransactionType.INCOME;
  }

  get isExpense(): boolean {
    return this.type === TransactionType.EXPENSE;
  }
}