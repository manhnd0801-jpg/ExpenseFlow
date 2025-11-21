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
import { LoanStatus, LoanType } from '../common/constants/enums';
import { LoanPayment } from './loan-payment.entity';
import { User } from './user.entity';

/**
 * Loan Entity - Loan management (credit cards, mortgages, auto loans)
 * Tracks borrowed money with amortization schedule and prepayment support
 */
@Entity('loans')
export class Loan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({
    type: 'smallint',
    comment: '1=Personal, 2=Mortgage, 3=Auto, 4=Business, 5=Other',
  })
  type: LoanType;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  lender: string; // Bank/Organization name

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  originalAmount: number; // Total loan amount

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  remainingPrincipal: number; // Remaining principal to pay

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  interestRate: number; // Annual interest rate percentage (e.g., 12.5)

  @Column({ type: 'integer' })
  termMonths: number; // Total loan term in months

  @Column({ type: 'integer' })
  remainingMonths: number; // Remaining months to pay

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  monthlyPayment: number; // Calculated monthly payment (principal + interest)

  @Column({ type: 'date' })
  startDate: Date; // Loan start date

  @Column({ type: 'date', nullable: true })
  nextPaymentDate: Date; // Next scheduled payment date

  @Column({ type: 'date', nullable: true })
  lastPaymentDate: Date; // Last payment made date

  @Column({
    type: 'smallint',
    default: LoanStatus.ACTIVE,
    comment: '1=Active, 2=Paid Off, 3=Defaulted, 4=Refinanced',
  })
  status: LoanStatus;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalInterestPaid: number; // Total interest paid to date

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalPrincipalPaid: number; // Total principal paid to date

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalPrepayment: number; // Total prepayment made

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'boolean', default: true })
  reminderEnabled: boolean;

  @Column({ type: 'integer', default: 3 })
  reminderDaysBefore: number; // Days before payment due to send reminder

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;

  // Relationships
  @ManyToOne(() => User, (user) => user.loans)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => LoanPayment, (payment) => payment.loan)
  payments: LoanPayment[];

  // Virtual properties
  get totalPaid(): number {
    return this.totalPrincipalPaid + this.totalInterestPaid;
  }

  get remainingAmount(): number {
    return this.remainingPrincipal;
  }

  get progressPercentage(): number {
    if (this.originalAmount === 0) return 0;
    return (this.totalPrincipalPaid / this.originalAmount) * 100;
  }

  get isOverdue(): boolean {
    if (!this.nextPaymentDate || this.status !== LoanStatus.ACTIVE) return false;
    return new Date() > new Date(this.nextPaymentDate);
  }
}
