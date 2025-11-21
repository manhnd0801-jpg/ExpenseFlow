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
import { AccountType, Currency } from '../common/constants/enums';
import { Transaction } from './transaction.entity';
import { User } from './user.entity';

/**
 * Account Entity - User's financial accounts
 * Stores information about user's various accounts (cash, bank, credit card, etc.)
 */
@Entity('accounts')
export class Account {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ 
    type: 'smallint',
    comment: '1=Cash, 2=Bank, 3=Credit Card, 4=E-Wallet, 5=Investment'
  })
  type: AccountType;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  balance: number;

  @Column({ 
    type: 'smallint', 
    default: Currency.VND,
    comment: '1=VND, 2=USD, 3=EUR, 4=JPY, 5=CNY'
  })
  currency: Currency;

  @Column({ type: 'varchar', length: 255, nullable: true })
  bankName: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  accountNumber: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 7, nullable: true })
  color: string; // Hex color for UI

  @Column({ type: 'varchar', length: 50, nullable: true })
  icon: string; // Icon name for UI

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: true })
  includeInTotal: boolean; // Whether to include in total balance calculation

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  creditLimit: number; // For credit cards

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  interestRate: number; // Annual interest rate percentage

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;

  // Relationships
  @ManyToOne(() => User, user => user.accounts)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => Transaction, transaction => transaction.account)
  transactions: Transaction[];

  @OneToMany(() => Transaction, transaction => transaction.toAccount)
  transfersTo: Transaction[];

  // Virtual properties
  get availableBalance(): number {
    if (this.type === AccountType.CREDIT_CARD && this.creditLimit) {
      return this.creditLimit - Math.abs(this.balance);
    }
    return this.balance;
  }

  get isOverLimit(): boolean {
    if (this.type === AccountType.CREDIT_CARD && this.creditLimit) {
      return Math.abs(this.balance) > this.creditLimit;
    }
    return false;
  }
}