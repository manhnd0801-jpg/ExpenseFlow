import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PaymentStatus } from '../common/constants/enums';
import { DateToString, DecimalToNumber } from '../common/decorators';
import { Account } from './account.entity';
import { Debt } from './debt.entity';
import { Transaction } from './transaction.entity';

/**
 * DebtPayment Entity - Debt payment records
 * Tracks individual payments for debts
 */
@Entity('debt_payments')
export class DebtPayment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'debt_id', type: 'uuid' })
  debtId: string;

  @DecimalToNumber()
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number; // Total payment amount (principal + interest)

  @DecimalToNumber()
  @Column({ name: 'principal_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  principalAmount: number; // Principal portion of the payment

  @DecimalToNumber()
  @Column({ name: 'interest_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  interestAmount: number; // Interest portion of the payment

  @Column({ name: 'account_id', type: 'uuid', nullable: true })
  accountId?: string; // Account receiving money (lending) or paying money (borrowing)

  @Column({ name: 'transaction_id', type: 'uuid', nullable: true })
  transactionId?: string; // Transaction created for this payment

  @Column({ type: 'timestamp' })
  @DateToString()
  paymentDate: Date;

  @Column({
    type: 'smallint',
    default: PaymentStatus.PAID,
    comment: '1=Pending, 2=Paid, 3=Failed, 4=Skipped',
  })
  status: PaymentStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  method: string; // Payment method (cash, bank transfer, etc.)

  @Column({ type: 'varchar', length: 255, nullable: true })
  reference: string; // Payment reference/receipt number

  @Column({ type: 'text', nullable: true })
  note: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => Debt, (debt) => debt.payments)
  @JoinColumn({ name: 'debt_id' })
  debt: Debt;

  @ManyToOne(() => Account)
  @JoinColumn({ name: 'account_id' })
  account: Account;

  @ManyToOne(() => Transaction, { nullable: true })
  @JoinColumn({ name: 'transaction_id' })
  transaction?: Transaction;

  // Virtual properties
  get isPaid(): boolean {
    return this.status === PaymentStatus.PAID;
  }

  get isPending(): boolean {
    return this.status === PaymentStatus.PENDING;
  }
}
