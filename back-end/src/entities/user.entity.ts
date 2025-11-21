import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Currency, UserStatus } from '../common/constants/enums';
import { Account } from './account.entity';
import { Budget } from './budget.entity';
import { Category } from './category.entity';
import { Debt } from './debt.entity';
import { Event } from './event.entity';
import { Goal } from './goal.entity';
import { Loan } from './loan.entity';
import { Notification } from './notification.entity';
import { RecurringTransaction } from './recurring-transaction.entity';
import { Reminder } from './reminder.entity';
import { SharedBookMember } from './shared-book-member.entity';
import { SharedBook } from './shared-book.entity';
import { Transaction } from './transaction.entity';

/**
 * User Entity - Core user information
 * Stores user account details and authentication information
 */
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'varchar', length: 100 })
  firstName: string;

  @Column({ type: 'varchar', length: 100 })
  lastName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  avatar: string;

  @Column({
    type: 'smallint',
    default: UserStatus.ACTIVE,
    comment: '1=Active, 2=Inactive, 3=Suspended, 4=Deleted',
  })
  status: UserStatus;

  @Column({
    type: 'smallint',
    default: Currency.VND,
    comment: '1=VND, 2=USD, 3=EUR, 4=JPY, 5=CNY',
  })
  defaultCurrency: Currency;

  @Column({ type: 'varchar', length: 10, default: 'vi' })
  language: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  timezone: string;

  @Column({ type: 'boolean', default: false })
  emailVerified: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  emailVerificationToken: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  passwordResetToken: string;

  @Column({ type: 'timestamp', nullable: true })
  passwordResetExpires: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;

  // Relationships
  @OneToMany(() => Account, (account) => account.user)
  accounts: Account[];

  @OneToMany(() => Transaction, (transaction) => transaction.user)
  transactions: Transaction[];

  @OneToMany(() => Category, (category) => category.user)
  categories: Category[];

  @OneToMany(() => Budget, (budget) => budget.user)
  budgets: Budget[];

  @OneToMany(() => Goal, (goal) => goal.user)
  goals: Goal[];

  @OneToMany(() => Debt, (debt) => debt.user)
  debts: Debt[];

  @OneToMany(() => Event, (event) => event.user)
  events: Event[];

  @OneToMany(() => Reminder, (reminder) => reminder.user)
  reminders: Reminder[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];

  @OneToMany(() => SharedBook, (book) => book.owner)
  ownedBooks: SharedBook[];

  @OneToMany(() => SharedBookMember, (membership) => membership.user)
  sharedBookMemberships: SharedBookMember[];

  @OneToMany(() => RecurringTransaction, (recurring) => recurring.user)
  recurringTransactions: RecurringTransaction[];

  @OneToMany(() => Loan, (loan) => loan.user)
  loans: Loan[];

  // Virtual properties
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`.trim();
  }
}
