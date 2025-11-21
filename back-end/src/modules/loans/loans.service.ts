import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoanStatus, PaymentStatus } from '../../common/constants/enums';
import { LoanPayment } from '../../entities/loan-payment.entity';
import { Loan } from '../../entities/loan.entity';
import { CreateLoanDto, CreateLoanPaymentDto, QueryLoanDto, SimulatePrepaymentDto, UpdateLoanDto } from './dto';

/**
 * Amortization Schedule Entry
 */
export interface IAmortizationEntry {
  paymentNumber: number;
  paymentDate: Date;
  payment: number;
  principal: number;
  interest: number;
  remainingPrincipal: number;
}

/**
 * Prepayment Simulation Result
 */
export interface IPrepaymentSimulation {
  originalTermMonths: number;
  newTermMonths: number;
  originalMonthlyPayment: number;
  newMonthlyPayment: number;
  totalInterestSaved: number;
  monthsSaved: number;
}

@Injectable()
export class LoansService {
  constructor(
    @InjectRepository(Loan)
    private readonly loanRepository: Repository<Loan>,
    @InjectRepository(LoanPayment)
    private readonly loanPaymentRepository: Repository<LoanPayment>,
  ) {}

  /**
   * Calculate monthly payment using amortization formula
   * Formula: M = P * [r(1+r)^n] / [(1+r)^n - 1]
   * Where:
   * M = Monthly payment
   * P = Principal
   * r = Monthly interest rate (annual rate / 12)
   * n = Number of payments
   */
  private calculateMonthlyPayment(principal: number, annualRate: number, months: number): number {
    if (annualRate === 0) {
      return principal / months;
    }

    const monthlyRate = annualRate / 100 / 12;
    const payment =
      (principal * (monthlyRate * Math.pow(1 + monthlyRate, months))) / (Math.pow(1 + monthlyRate, months) - 1);

    return Math.round(payment * 100) / 100;
  }

  /**
   * Generate amortization schedule
   */
  generateAmortizationSchedule(loan: Loan): IAmortizationEntry[] {
    const schedule: IAmortizationEntry[] = [];
    const monthlyRate = loan.interestRate / 100 / 12;
    let remainingPrincipal = loan.remainingPrincipal;
    const startDate = loan.nextPaymentDate ? new Date(loan.nextPaymentDate) : new Date(loan.startDate);

    for (let i = 0; i < loan.remainingMonths; i++) {
      const interestPayment = remainingPrincipal * monthlyRate;
      const principalPayment = loan.monthlyPayment - interestPayment;
      remainingPrincipal -= principalPayment;

      // Ensure last payment covers any rounding differences
      if (i === loan.remainingMonths - 1) {
        remainingPrincipal = 0;
      }

      const paymentDate = new Date(startDate);
      paymentDate.setMonth(paymentDate.getMonth() + i);

      schedule.push({
        paymentNumber: i + 1,
        paymentDate,
        payment: Math.round(loan.monthlyPayment * 100) / 100,
        principal: Math.round(principalPayment * 100) / 100,
        interest: Math.round(interestPayment * 100) / 100,
        remainingPrincipal: Math.max(0, Math.round(remainingPrincipal * 100) / 100),
      });
    }

    return schedule;
  }

  /**
   * Simulate prepayment
   */
  simulatePrepayment(loan: Loan, dto: SimulatePrepaymentDto): IPrepaymentSimulation {
    const newPrincipal = loan.remainingPrincipal - dto.prepaymentAmount;

    if (newPrincipal <= 0) {
      return {
        originalTermMonths: loan.remainingMonths,
        newTermMonths: 0,
        originalMonthlyPayment: loan.monthlyPayment,
        newMonthlyPayment: 0,
        totalInterestSaved: 0,
        monthsSaved: loan.remainingMonths,
      };
    }

    let newTermMonths = loan.remainingMonths;
    let newMonthlyPayment = loan.monthlyPayment;

    if (dto.strategy === 'reduce_term') {
      // Keep same monthly payment, reduce term
      newTermMonths = this.calculateNewTerm(newPrincipal, loan.interestRate, loan.monthlyPayment);
      newMonthlyPayment = loan.monthlyPayment;
    } else {
      // Keep same term, reduce monthly payment
      newMonthlyPayment = this.calculateMonthlyPayment(newPrincipal, loan.interestRate, loan.remainingMonths);
      newTermMonths = loan.remainingMonths;
    }

    // Calculate interest saved
    const originalTotalInterest = loan.monthlyPayment * loan.remainingMonths - loan.remainingPrincipal;
    const newTotalInterest = newMonthlyPayment * newTermMonths - newPrincipal;
    const interestSaved = originalTotalInterest - newTotalInterest;

    return {
      originalTermMonths: loan.remainingMonths,
      newTermMonths,
      originalMonthlyPayment: loan.monthlyPayment,
      newMonthlyPayment,
      totalInterestSaved: Math.round(interestSaved * 100) / 100,
      monthsSaved: loan.remainingMonths - newTermMonths,
    };
  }

  /**
   * Calculate new loan term after prepayment
   */
  private calculateNewTerm(principal: number, annualRate: number, monthlyPayment: number): number {
    if (annualRate === 0) {
      return Math.ceil(principal / monthlyPayment);
    }

    const monthlyRate = annualRate / 100 / 12;
    const months = Math.ceil(
      Math.log(monthlyPayment / (monthlyPayment - principal * monthlyRate)) / Math.log(1 + monthlyRate),
    );

    return months;
  }

  /**
   * Create new loan
   */
  async create(userId: string, dto: CreateLoanDto): Promise<Loan> {
    const monthlyPayment = this.calculateMonthlyPayment(dto.originalAmount, dto.interestRate, dto.termMonths);

    const startDate = new Date(dto.startDate);
    const nextPaymentDate = new Date(startDate);
    nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);

    const loan = this.loanRepository.create({
      userId,
      type: dto.type,
      name: dto.name,
      lender: dto.lender,
      originalAmount: dto.originalAmount,
      remainingPrincipal: dto.originalAmount,
      interestRate: dto.interestRate,
      termMonths: dto.termMonths,
      remainingMonths: dto.termMonths,
      monthlyPayment,
      startDate,
      nextPaymentDate,
      status: LoanStatus.ACTIVE,
      description: dto.description,
      notes: dto.notes,
      reminderEnabled: dto.reminderEnabled ?? true,
      reminderDaysBefore: dto.reminderDaysBefore ?? 3,
      totalInterestPaid: 0,
      totalPrincipalPaid: 0,
      totalPrepayment: 0,
    });

    return await this.loanRepository.save(loan);
  }

  /**
   * Get all loans for user with pagination
   */
  async findAll(userId: string, query: QueryLoanDto) {
    const { page = 1, limit = 20, type, status } = query;

    const queryBuilder = this.loanRepository
      .createQueryBuilder('loan')
      .where('loan.userId = :userId', { userId })
      .andWhere('loan.deletedAt IS NULL');

    if (type) {
      queryBuilder.andWhere('loan.type = :type', { type });
    }

    if (status) {
      queryBuilder.andWhere('loan.status = :status', { status });
    }

    queryBuilder
      .orderBy('loan.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await queryBuilder.getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get loan by ID
   */
  async findOne(id: string, userId: string): Promise<Loan> {
    const loan = await this.loanRepository.findOne({
      where: { id, userId, deletedAt: null },
      relations: ['payments'],
    });

    if (!loan) {
      throw new NotFoundException('Loan not found');
    }

    return loan;
  }

  /**
   * Update loan
   */
  async update(id: string, userId: string, dto: UpdateLoanDto): Promise<Loan> {
    const loan = await this.findOne(id, userId);

    // Recalculate monthly payment if amount, rate, or term changed
    if (dto.originalAmount || dto.interestRate || dto.termMonths) {
      const principal = dto.originalAmount ?? loan.originalAmount;
      const rate = dto.interestRate ?? loan.interestRate;
      const months = dto.termMonths ?? loan.termMonths;

      loan.monthlyPayment = this.calculateMonthlyPayment(principal, rate, months);
    }

    Object.assign(loan, dto);
    return await this.loanRepository.save(loan);
  }

  /**
   * Delete loan (soft delete)
   */
  async remove(id: string, userId: string): Promise<void> {
    const loan = await this.findOne(id, userId);
    await this.loanRepository.softDelete(id);
  }

  /**
   * Record loan payment
   */
  async recordPayment(loanId: string, userId: string, dto: CreateLoanPaymentDto): Promise<LoanPayment> {
    const loan = await this.findOne(loanId, userId);

    if (loan.status !== LoanStatus.ACTIVE) {
      throw new Error('Cannot record payment for inactive loan');
    }

    const monthlyRate = loan.interestRate / 100 / 12;
    const interestAmount = loan.remainingPrincipal * monthlyRate;
    const principalAmount = dto.amount - interestAmount;
    const prepayment = dto.prepaymentAmount || 0;

    const newRemainingPrincipal = loan.remainingPrincipal - principalAmount - prepayment;

    // Create payment record
    const payment = this.loanPaymentRepository.create({
      loanId: loan.id,
      paymentDate: new Date(dto.paymentDate),
      dueDate: loan.nextPaymentDate,
      amount: dto.amount,
      principalAmount: principalAmount + prepayment,
      interestAmount,
      prepaymentAmount: prepayment,
      remainingPrincipal: Math.max(0, newRemainingPrincipal),
      status: PaymentStatus.PAID,
      isPrepayment: dto.isPrepayment ?? false,
      isScheduled: true,
      note: dto.note,
    });

    await this.loanPaymentRepository.save(payment);

    // Update loan
    loan.remainingPrincipal = Math.max(0, newRemainingPrincipal);
    loan.totalPrincipalPaid += principalAmount + prepayment;
    loan.totalInterestPaid += interestAmount;
    loan.totalPrepayment += prepayment;
    loan.lastPaymentDate = new Date(dto.paymentDate);

    // Update next payment date
    const nextDate = new Date(loan.nextPaymentDate);
    nextDate.setMonth(nextDate.getMonth() + 1);
    loan.nextPaymentDate = nextDate;

    // Recalculate remaining months if prepayment made
    if (prepayment > 0) {
      loan.remainingMonths = this.calculateNewTerm(loan.remainingPrincipal, loan.interestRate, loan.monthlyPayment);
    } else {
      loan.remainingMonths = Math.max(0, loan.remainingMonths - 1);
    }

    // Check if loan paid off
    if (loan.remainingPrincipal <= 0 || loan.remainingMonths <= 0) {
      loan.status = LoanStatus.PAID_OFF;
      loan.remainingMonths = 0;
      loan.remainingPrincipal = 0;
    }

    await this.loanRepository.save(loan);

    return payment;
  }

  /**
   * Get loan payments history
   */
  async getPayments(loanId: string, userId: string): Promise<LoanPayment[]> {
    await this.findOne(loanId, userId);

    return await this.loanPaymentRepository.find({
      where: { loanId },
      order: { paymentDate: 'DESC' },
    });
  }
}
