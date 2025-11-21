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
import { Debt } from './debt.entity';

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

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ type: 'date' })
  paymentDate: Date;

  @Column({ 
    type: 'smallint',
    default: PaymentStatus.PAID,
    comment: '1=Pending, 2=Paid, 3=Failed, 4=Skipped'
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
  @ManyToOne(() => Debt, debt => debt.payments)
  @JoinColumn({ name: 'debt_id' })
  debt: Debt;

  // Virtual properties
  get isPaid(): boolean {
    return this.status === PaymentStatus.PAID;
  }

  get isPending(): boolean {
    return this.status === PaymentStatus.PENDING;
  }
}