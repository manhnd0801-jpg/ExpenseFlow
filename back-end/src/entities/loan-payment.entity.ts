import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PaymentStatus } from '../common/constants/enums';
import { Loan } from './loan.entity';

/**
 * LoanPayment Entity - Records loan payments
 * Tracks both scheduled and prepayments
 */
@Entity('loan_payments')
export class LoanPayment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'loan_id', type: 'uuid' })
  loanId: string;

  @Column({ type: 'integer', nullable: true })
  paymentNumber: number; // Payment sequence (1, 2, 3...)

  @Column({ type: 'date' })
  paymentDate: Date;

  @Column({ type: 'date', nullable: true })
  dueDate: Date; // Original due date for scheduled payments

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number; // Total payment amount

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  principalAmount: number; // Principal portion

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  interestAmount: number; // Interest portion

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  prepaymentAmount: number; // Extra payment towards principal

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  remainingPrincipal: number; // Principal balance after this payment

  @Column({
    type: 'smallint',
    default: PaymentStatus.PAID,
    comment: '1=Pending, 2=Paid, 3=Failed, 4=Skipped',
  })
  status: PaymentStatus;

  @Column({ type: 'boolean', default: false })
  isPrepayment: boolean; // True if this is an extra payment

  @Column({ type: 'boolean', default: false })
  isScheduled: boolean; // True if this is a scheduled payment

  @Column({ type: 'text', nullable: true })
  note: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  transactionId: string; // Link to transaction entity if needed

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relationships
  @ManyToOne(() => Loan, (loan) => loan.payments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'loan_id' })
  loan: Loan;

  // Virtual properties
  get isPaid(): boolean {
    return this.status === PaymentStatus.PAID;
  }

  get isLate(): boolean {
    if (!this.dueDate || this.isPaid) return false;
    return new Date() > new Date(this.dueDate);
  }
}
