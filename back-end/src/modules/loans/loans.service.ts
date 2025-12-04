import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CategoryType, LoanStatus, PaymentStatus, TransactionType } from '../../common/constants/enums';
import { addVND, roundVND, subtractVND } from '../../common/utils/currency.util';
import { Account } from '../../entities/account.entity';
import { Category } from '../../entities/category.entity';
import { LoanPayment } from '../../entities/loan-payment.entity';
import { Loan } from '../../entities/loan.entity';
import { Transaction } from '../../entities/transaction.entity';
import {
  CreateLoanDto,
  CreateLoanPaymentDto,
  ExtraPrincipalPaymentDto,
  QueryLoanDto,
  SimulatePrepaymentDto,
  UpdateLoanDto,
} from './dto';

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
  // Payment status fields (for getPaymentScheduleWithStatus)
  isPaid?: boolean;
  status?: 'paid' | 'unpaid';
  actualPaymentDate?: Date | null;
  actualAmount?: number | null;
  paymentId?: string | null;
  note?: string | null;
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
  newSchedule?: IAmortizationEntry[]; // New amortization schedule after prepayment
  originalTotalInterest: number;
  newTotalInterest: number;
}

@Injectable()
export class LoansService {
  private readonly logger = new Logger(LoansService.name);

  constructor(
    @InjectRepository(Loan)
    private readonly loanRepository: Repository<Loan>,
    @InjectRepository(LoanPayment)
    private readonly loanPaymentRepository: Repository<LoanPayment>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly dataSource: DataSource,
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
   * Get payment schedule with status (paid/unpaid) for all term months
   * Combines amortization schedule with actual payment records
   */
  async getPaymentScheduleWithStatus(loanId: string, userId: string) {
    const loan = await this.loanRepository.findOne({
      where: { id: loanId, userId, deletedAt: null },
      relations: ['payments'],
    });

    if (!loan) {
      throw new NotFoundException('Loan not found');
    }

    // Filter out only SCHEDULED payments (isPrepayment = false or null)
    // Extra principal payments have isPrepayment = true
    const scheduledPayments = (loan.payments || [])
      .filter((p) => !p.isPrepayment) // Only scheduled monthly payments
      .sort((a, b) => new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime());

    // Count how many scheduled payments have been made
    const totalMonthsPaid = scheduledPayments.length;

    this.logger.log(
      `Payment schedule for loan ${loanId}: ` +
        `Total payments: ${loan.payments?.length || 0}, ` +
        `Scheduled payments: ${scheduledPayments.length}, ` +
        `Extra principal payments: ${(loan.payments || []).filter((p) => p.isPrepayment).length}`,
    );

    // Generate schedule with mixed data:
    // - Paid months: Use actual payment data (preserves old monthlyPayment)
    // - Unpaid months: Calculate with current monthlyPayment
    const scheduleWithStatus: IAmortizationEntry[] = [];
    const monthlyRate = loan.interestRate / 100 / 12;
    let remainingPrincipal = loan.originalAmount;

    // FIXED: Always use loan.startDate as the base, not nextPaymentDate
    // This ensures consistent schedule dates regardless of payment progress
    const scheduleStartDate = new Date(loan.startDate);

    for (let i = 0; i < loan.termMonths; i++) {
      const monthNumber = i + 1;
      const isPaid = monthNumber <= totalMonthsPaid;
      const paymentRecord = isPaid ? scheduledPayments[monthNumber - 1] : null;

      let payment: number;
      let principalPayment: number;
      let interestPayment: number;

      if (isPaid && paymentRecord) {
        // Use actual payment data for paid months
        payment = paymentRecord.amount;
        principalPayment = paymentRecord.principalAmount;
        interestPayment = paymentRecord.interestAmount;
        remainingPrincipal = paymentRecord.remainingPrincipal;
      } else {
        // Calculate for unpaid months using current monthlyPayment
        interestPayment = remainingPrincipal * monthlyRate;
        principalPayment = loan.monthlyPayment - interestPayment;
        payment = loan.monthlyPayment;
        remainingPrincipal -= principalPayment;

        // Ensure last payment covers any rounding differences
        if (i === loan.termMonths - 1) {
          remainingPrincipal = 0;
        }
      }

      const paymentDate = new Date(scheduleStartDate);
      paymentDate.setMonth(paymentDate.getMonth() + i);

      scheduleWithStatus.push({
        paymentNumber: monthNumber,
        paymentDate,
        payment: Math.round(payment * 100) / 100,
        principal: Math.round(principalPayment * 100) / 100,
        interest: Math.round(interestPayment * 100) / 100,
        remainingPrincipal: Math.max(0, Math.round(remainingPrincipal * 100) / 100),
        isPaid,
        status: isPaid ? 'paid' : 'unpaid',
        actualPaymentDate: paymentRecord?.paymentDate || null,
        actualAmount: paymentRecord?.amount || null,
        paymentId: paymentRecord?.id || null,
        note: paymentRecord?.note || null,
      });
    }

    return scheduleWithStatus;
  }

  /**
   * Simulate prepayment
   */
  simulatePrepayment(loan: Loan, dto: SimulatePrepaymentDto): IPrepaymentSimulation {
    const newPrincipal = loan.remainingPrincipal - dto.prepaymentAmount;

    if (newPrincipal <= 0) {
      const originalTotalInterest = loan.monthlyPayment * loan.remainingMonths - loan.remainingPrincipal;
      return {
        originalTermMonths: loan.remainingMonths,
        newTermMonths: 0,
        originalMonthlyPayment: loan.monthlyPayment,
        newMonthlyPayment: 0,
        totalInterestSaved: originalTotalInterest,
        monthsSaved: loan.remainingMonths,
        originalTotalInterest,
        newTotalInterest: 0,
        newSchedule: [],
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

    // Generate new amortization schedule
    const newSchedule = this.generateScheduleForSimulation(
      newPrincipal,
      loan.interestRate,
      newMonthlyPayment,
      newTermMonths,
      loan.nextPaymentDate,
    );

    return {
      originalTermMonths: loan.remainingMonths,
      newTermMonths,
      originalMonthlyPayment: loan.monthlyPayment,
      newMonthlyPayment,
      totalInterestSaved: Math.round(interestSaved * 100) / 100,
      monthsSaved: loan.remainingMonths - newTermMonths,
      originalTotalInterest: Math.round(originalTotalInterest * 100) / 100,
      newTotalInterest: Math.round(newTotalInterest * 100) / 100,
      newSchedule,
    };
  }

  /**
   * Generate amortization schedule for simulation (helper)
   */
  private generateScheduleForSimulation(
    principal: number,
    annualRate: number,
    monthlyPayment: number,
    months: number,
    startDate: Date,
  ): IAmortizationEntry[] {
    const schedule: IAmortizationEntry[] = [];
    const monthlyRate = annualRate / 100 / 12;
    let remainingPrincipal = principal;

    for (let i = 0; i < months; i++) {
      const interestPayment = remainingPrincipal * monthlyRate;
      const principalPayment = monthlyPayment - interestPayment;
      remainingPrincipal -= principalPayment;

      // Ensure last payment covers any rounding differences
      if (i === months - 1) {
        remainingPrincipal = 0;
      }

      const paymentDate = new Date(startDate);
      paymentDate.setMonth(paymentDate.getMonth() + i);

      schedule.push({
        paymentNumber: i + 1,
        paymentDate,
        payment: Math.round(monthlyPayment * 100) / 100,
        principal: Math.round(principalPayment * 100) / 100,
        interest: Math.round(interestPayment * 100) / 100,
        remainingPrincipal: Math.max(0, Math.round(remainingPrincipal * 100) / 100),
      });
    }

    return schedule;
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
   * Also creates an income transaction if accountId is provided
   */
  async create(userId: string, dto: CreateLoanDto): Promise<Loan> {
    // Round amounts for VND
    const roundedOriginalAmount = roundVND(dto.originalAmount);
    const monthlyPayment = roundVND(
      this.calculateMonthlyPayment(roundedOriginalAmount, dto.interestRate, dto.termMonths),
    );

    // Validate account if provided
    let account: Account | null = null;
    if (dto.accountId) {
      account = await this.accountRepository.findOne({
        where: { id: dto.accountId, userId },
      });
      if (!account) {
        throw new BadRequestException('Account not found');
      }
    }

    const startDate = new Date(dto.startDate);

    // If account is provided, disbursement date is now
    // Otherwise, use startDate as disbursement reference
    const disbursementDate = dto.accountId ? new Date() : new Date(startDate);

    // Next payment date is 1 month after disbursement date
    const nextPaymentDate = new Date(disbursementDate);
    nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);

    // Use transaction to ensure data consistency
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create loan
      const loan = this.loanRepository.create({
        userId,
        type: dto.type,
        name: dto.name,
        lender: dto.lender,
        originalAmount: roundedOriginalAmount,
        remainingPrincipal: roundedOriginalAmount,
        interestRate: dto.interestRate,
        termMonths: dto.termMonths,
        remainingMonths: dto.termMonths,
        monthlyPayment,
        startDate,
        nextPaymentDate,
        accountId: account?.id, // Save account if disbursed
        disbursementDate: account ? disbursementDate : null, // Save disbursement timestamp
        status: LoanStatus.ACTIVE,
        description: dto.description,
        notes: dto.notes,
        reminderEnabled: dto.reminderEnabled ?? true,
        reminderDaysBefore: dto.reminderDaysBefore ?? 3,
        totalInterestPaid: 0,
        totalPrincipalPaid: 0,
        totalPrepayment: 0,
      });

      const savedLoan = await queryRunner.manager.save(Loan, loan);

      // Create income transaction if account is provided
      if (account) {
        // Find or create "Loan Disbursement" category
        let loanCategory = await queryRunner.manager.findOne(Category, {
          where: { userId, name: 'Loan Disbursement', type: CategoryType.INCOME },
        });

        if (!loanCategory) {
          loanCategory = queryRunner.manager.create(Category, {
            userId,
            name: 'Loan Disbursement',
            type: CategoryType.INCOME,
            description: 'Auto-created category for loan disbursements',
            icon: '💰',
            color: '#10b981',
          });
          loanCategory = await queryRunner.manager.save(Category, loanCategory);
        }

        // Create transaction
        const transaction = queryRunner.manager.create(Transaction, {
          userId,
          accountId: account.id,
          categoryId: loanCategory.id,
          loanId: savedLoan.id, // Link transaction to loan
          type: TransactionType.INCOME,
          amount: roundedOriginalAmount,
          date: startDate,
          description: `Loan disbursement: ${dto.name}${dto.lender ? ` from ${dto.lender}` : ''}`,
          note: `Loan ID: ${savedLoan.id}`,
        });

        await queryRunner.manager.save(Transaction, transaction);

        // Update account balance (same logic as transactions.service.ts)
        const currentBalance = Number(account.balance);
        account.balance = addVND(currentBalance, roundedOriginalAmount);
        await queryRunner.manager.save(Account, account);

        this.logger.log(
          `Created loan disbursement transaction and updated balance: ${currentBalance} + ${roundedOriginalAmount} = ${account.balance}`,
        );
      }

      await queryRunner.commitTransaction();

      this.logger.log(`Loan created successfully: ${savedLoan.id} - ${savedLoan.name}`);

      return savedLoan;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Failed to create loan: ${error.message}`, error.stack);
      throw error;
    } finally {
      await queryRunner.release();
    }
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
      .orderBy('loan.updatedAt', 'DESC')
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

    // Prevent changing accountId if loan is already disbursed
    if (dto.accountId && loan.accountId && dto.accountId !== loan.accountId) {
      throw new BadRequestException(
        'Cannot change disbursement account. Loan has already been disbursed to another account.',
      );
    }

    // Handle disbursement if accountId is being set for the first time
    const isDisbursing = dto.accountId && !loan.accountId && !loan.disbursementDate;

    if (isDisbursing) {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // Get account
        const account = await queryRunner.manager.findOne(Account, {
          where: { id: dto.accountId, userId },
        });

        if (!account) {
          throw new NotFoundException('Account not found');
        }

        // Update loan with disbursement info
        loan.accountId = dto.accountId;
        loan.disbursementDate = new Date();

        // Find or create "Loan Disbursement" category
        let loanCategory = await queryRunner.manager.findOne(Category, {
          where: { userId, name: 'Loan Disbursement', type: CategoryType.INCOME },
        });

        if (!loanCategory) {
          loanCategory = queryRunner.manager.create(Category, {
            userId,
            name: 'Loan Disbursement',
            type: CategoryType.INCOME,
            description: 'Auto-created category for loan disbursements',
            icon: '💰',
            color: '#10b981',
          });
          loanCategory = await queryRunner.manager.save(Category, loanCategory);
        }

        // Create transaction
        const transaction = queryRunner.manager.create(Transaction, {
          userId,
          accountId: account.id,
          categoryId: loanCategory.id,
          loanId: loan.id, // Link transaction to loan
          type: TransactionType.INCOME,
          amount: loan.originalAmount,
          date: new Date(),
          description: `Loan disbursement: ${loan.name}${loan.lender ? ` from ${loan.lender}` : ''}`,
          note: `Loan ID: ${loan.id}`,
        });

        await queryRunner.manager.save(Transaction, transaction);

        // Update account balance
        const currentBalance = Number(account.balance);
        const loanAmount = Number(loan.originalAmount);
        const newBalance = currentBalance + loanAmount;
        await queryRunner.manager.update(Account, account.id, { balance: newBalance });

        this.logger.log(
          `Loan disbursed during update: ${loan.id} - Created transaction and updated balance: ${currentBalance} + ${loanAmount} = ${newBalance}`,
        );

        // Update other fields
        Object.assign(loan, dto);

        // Recalculate monthly payment if amount, rate, or term changed
        if (dto.originalAmount || dto.interestRate || dto.termMonths) {
          const principal = dto.originalAmount ?? loan.originalAmount;
          const rate = dto.interestRate ?? loan.interestRate;
          const months = dto.termMonths ?? loan.termMonths;

          loan.monthlyPayment = this.calculateMonthlyPayment(principal, rate, months);
        }

        const savedLoan = await queryRunner.manager.save(Loan, loan);
        await queryRunner.commitTransaction();

        return savedLoan;
      } catch (error) {
        await queryRunner.rollbackTransaction();
        this.logger.error(`Failed to disburse loan during update: ${error.message}`, error.stack);
        throw error;
      } finally {
        await queryRunner.release();
      }
    }

    // Normal update without disbursement
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
   * Delete loan (soft delete with validation)
   * Prevents deletion if loan has payment history or has been disbursed
   */
  async remove(id: string, userId: string): Promise<void> {
    const loan = await this.findOne(id, userId);

    // Check if loan has payment history
    if (loan.totalPrincipalPaid > 0 || loan.totalInterestPaid > 0) {
      throw new BadRequestException(
        'Cannot delete loan with payment history. Please settle or reconcile all payments first.',
      );
    }

    // Check if loan has been disbursed (simpler check using disbursementDate field)
    if (loan.disbursementDate || loan.accountId) {
      throw new BadRequestException(
        'Cannot delete disbursed loan. The loan disbursement has been recorded as a transaction. ' +
          'Please delete the transaction first or contact administrator.',
      );
    }

    // Safe to delete - loan has no financial impact
    await this.loanRepository.softDelete(id);
    this.logger.log(`Loan deleted safely (no disbursement): ${loan.id} - ${loan.name}`);
  }

  /**
   * Record a payment for a loan
   */
  async recordPayment(loanId: string, userId: string, dto: CreateLoanPaymentDto): Promise<LoanPayment> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      this.logger.log(`Recording payment for loan ${loanId}, user ${userId}, dto: ${JSON.stringify(dto)}`);
      const loan = await this.findOne(loanId, userId);

      // Validation #1: Loan must be active
      if (loan.status !== LoanStatus.ACTIVE) {
        throw new BadRequestException('Cannot record payment for inactive loan');
      }

      // Validation #2: Check if loan has remaining principal
      if (loan.remainingPrincipal <= 0) {
        throw new BadRequestException('Loan is already paid off');
      }

      // Validation #3: Payment date must be valid
      const paymentDate = new Date(dto.paymentDate);
      const now = new Date();
      const maxFutureDate = new Date();
      maxFutureDate.setDate(maxFutureDate.getDate() + 7); // Allow up to 7 days in future

      if (paymentDate > maxFutureDate) {
        throw new BadRequestException('Payment date cannot be more than 7 days in the future');
      }

      if (paymentDate < new Date(loan.startDate)) {
        throw new BadRequestException('Payment date cannot be before loan start date');
      }

      // Validate account if provided
      let account: Account | null = null;
      if (dto.accountId) {
        this.logger.log(`Looking up account ${dto.accountId}`);
        account = await queryRunner.manager.findOne(Account, {
          where: { id: dto.accountId, userId, deletedAt: null },
        });

        if (!account) {
          throw new NotFoundException('Account not found');
        }

        // Check if account has sufficient balance
        if (account.balance < dto.amount) {
          throw new BadRequestException(
            `Insufficient account balance. Available: ${account.balance}, Required: ${dto.amount}`,
          );
        }
        this.logger.log(`Account found: ${account.name}, balance: ${account.balance}`);
      } else {
        this.logger.warn('No accountId provided - payment will be recorded but no transaction created');
      }

      // Calculate interest and principal for this payment
      // SIMPLIFIED: dto.amount is the scheduled monthly payment (no prepayment option)
      const monthlyRate = Number(loan.interestRate) / 100 / 12;
      const interestAmount = Number(loan.remainingPrincipal) * monthlyRate;
      const principalAmount = Number(dto.amount) - interestAmount;

      this.logger.log(`Payment calculation:`, {
        monthlyRate,
        remainingPrincipal: loan.remainingPrincipal,
        interestAmount,
        principalAmount,
        totalAmount: dto.amount,
      });

      // Validation #4: Amount must be >= monthly payment (unless it's final payment)
      const isLikelyFinalPayment = loan.remainingPrincipal <= loan.monthlyPayment * 1.5;
      if (!isLikelyFinalPayment && dto.amount < loan.monthlyPayment) {
        throw new BadRequestException(`Payment amount must be at least ${loan.monthlyPayment} (monthly payment)`);
      }

      const newRemainingPrincipal = Number(loan.remainingPrincipal) - principalAmount;

      // Create payment record
      this.logger.log(`Creating payment record for loan ID: ${loan.id}`);

      const paymentResult = await queryRunner.manager
        .createQueryBuilder()
        .insert()
        .into(LoanPayment)
        .values({
          loanId: loan.id,
          paymentDate: new Date(dto.paymentDate),
          dueDate: loan.nextPaymentDate,
          amount: dto.amount,
          principalAmount: principalAmount,
          interestAmount,
          prepaymentAmount: 0, // No prepayment in scheduled payments
          remainingPrincipal: Math.max(0, newRemainingPrincipal),
          status: PaymentStatus.PAID,
          isPrepayment: false, // Scheduled payments are not prepayments
          isScheduled: true,
          note: dto.note,
          previousRemainingMonths: loan.remainingMonths, // Store before updating
          previousMonthlyPayment: loan.monthlyPayment, // Store before updating
        })
        .execute();

      const savedPayment = await queryRunner.manager.findOne(LoanPayment, {
        where: { id: paymentResult.identifiers[0].id },
      });
      this.logger.log(`Payment record created with ID: ${savedPayment.id}`);

      // Deduct from account if provided
      if (account) {
        this.logger.log(`Creating transactions for ${dto.amount} from account ${account.name}`);

        // Note: We do NOT manually deduct from account balance here
        // The transactions will be created, and if they are processed by transactions module,
        // that module will handle the balance update automatically.
        // However, since we're using queryRunner.manager.create/save directly,
        // we need to manually update the account balance ONCE for the total amount.

        account.balance = subtractVND(account.balance, dto.amount);
        await queryRunner.manager.save(account);

        // Get categories for transactions (hybrid logic: specific -> common -> auto-create)
        let principalCategory: Category;
        let interestCategory: Category;

        // 1. Get principal category
        if (dto.principalCategoryId) {
          // User specified principal category
          principalCategory = await queryRunner.manager.findOne(Category, {
            where: { id: dto.principalCategoryId, userId, type: CategoryType.EXPENSE },
          });
          if (!principalCategory) {
            throw new BadRequestException('Principal category not found or not an expense category');
          }
          this.logger.log(`Using specified principal category: ${principalCategory.name}`);
        } else if (dto.categoryId) {
          // Fallback to common category
          principalCategory = await queryRunner.manager.findOne(Category, {
            where: { id: dto.categoryId, userId, type: CategoryType.EXPENSE },
          });
          if (!principalCategory) {
            throw new BadRequestException('Category not found or not an expense category');
          }
          this.logger.log(`Using common category for principal: ${principalCategory.name}`);
        } else {
          // Auto-create default principal category
          principalCategory = await queryRunner.manager.findOne(Category, {
            where: { userId, type: CategoryType.EXPENSE, name: 'Trả nợ' },
          });
          if (!principalCategory) {
            this.logger.log('Principal payment category not found, creating it automatically');
            principalCategory = queryRunner.manager.create(Category, {
              userId,
              name: 'Trả nợ',
              type: CategoryType.EXPENSE,
              icon: '💳',
              color: '#8B4513',
            });
            principalCategory = await queryRunner.manager.save(principalCategory);
            this.logger.log(`Created Principal category with ID: ${principalCategory.id}`);
          }
        }

        // 2. Get interest category
        if (dto.interestCategoryId) {
          // User specified interest category
          interestCategory = await queryRunner.manager.findOne(Category, {
            where: { id: dto.interestCategoryId, userId, type: CategoryType.EXPENSE },
          });
          if (!interestCategory) {
            throw new BadRequestException('Interest category not found or not an expense category');
          }
          this.logger.log(`Using specified interest category: ${interestCategory.name}`);
        } else if (dto.categoryId) {
          // Fallback to common category
          interestCategory = await queryRunner.manager.findOne(Category, {
            where: { id: dto.categoryId, userId, type: CategoryType.EXPENSE },
          });
          if (!interestCategory) {
            throw new BadRequestException('Category not found or not an expense category');
          }
          this.logger.log(`Using common category for interest: ${interestCategory.name}`);
        } else {
          // Auto-create default interest category
          interestCategory = await queryRunner.manager.findOne(Category, {
            where: { userId, type: CategoryType.EXPENSE, name: 'Lãi vay' },
          });
          if (!interestCategory) {
            this.logger.log('Interest payment category not found, creating it automatically');
            interestCategory = queryRunner.manager.create(Category, {
              userId,
              name: 'Lãi vay',
              type: CategoryType.EXPENSE,
              icon: '💸',
              color: '#DC143C',
            });
            interestCategory = await queryRunner.manager.save(interestCategory);
            this.logger.log(`Created Interest category with ID: ${interestCategory.id}`);
          }
        }

        const paymentDate = new Date(dto.paymentDate);
        const transactions: Transaction[] = [];

        // Create transaction for principal payment
        if (principalAmount > 0) {
          this.logger.log(`Creating principal transaction: ${principalAmount}`);
          const principalTransaction = queryRunner.manager.create(Transaction, {
            userId,
            accountId: account.id,
            categoryId: principalCategory.id,
            type: TransactionType.EXPENSE,
            amount: principalAmount,
            date: paymentDate,
            description: `Trả nợ gốc: ${loan.name}`,
            note: dto.note || 'Trả gốc hàng tháng',
            loanId: loan.id,
            paymentId: savedPayment.id,
          });
          transactions.push(await queryRunner.manager.save(principalTransaction));
          this.logger.log(`Principal transaction created with ID: ${principalTransaction.id}`);
        }

        // Create transaction for interest payment
        if (interestAmount > 0) {
          this.logger.log(`Creating interest transaction: ${interestAmount}`);
          const interestTransaction = queryRunner.manager.create(Transaction, {
            userId,
            accountId: account.id,
            categoryId: interestCategory.id,
            type: TransactionType.EXPENSE,
            amount: interestAmount,
            date: paymentDate,
            description: `Lãi vay: ${loan.name}`,
            note: dto.note || '',
            loanId: loan.id,
            paymentId: savedPayment.id,
          });
          transactions.push(await queryRunner.manager.save(interestTransaction));
          this.logger.log(`Interest transaction created with ID: ${interestTransaction.id}`);
        }

        this.logger.log(`Created ${transactions.length} transaction(s) for loan payment`);
      }

      // Update loan
      this.logger.log(`Updating loan balances`);
      loan.remainingPrincipal = Math.max(0, newRemainingPrincipal);
      loan.totalPrincipalPaid = Number(loan.totalPrincipalPaid) + principalAmount;
      loan.totalInterestPaid = Number(loan.totalInterestPaid) + interestAmount;
      loan.lastPaymentDate = new Date(dto.paymentDate);

      // Update next payment date - FIXED: Base on actual payment date, not old nextPaymentDate
      // This prevents accumulation of errors from missed or backdated payments
      const nextDate = new Date(dto.paymentDate);
      nextDate.setMonth(nextDate.getMonth() + 1);
      loan.nextPaymentDate = nextDate;

      // Decrease remaining months by 1 for regular payment
      // Monthly payment stays the same for scheduled payments
      loan.remainingMonths = Math.max(0, loan.remainingMonths - 1);

      // Check if loan paid off
      if (loan.remainingPrincipal <= 0 || loan.remainingMonths <= 0) {
        this.logger.log(`Loan fully paid off`);
        loan.status = LoanStatus.PAID_OFF;
        loan.remainingMonths = 0;
        loan.remainingPrincipal = 0;
      }

      // Update loan using update query instead of save to avoid cascade issues
      await queryRunner.manager.update(Loan, loan.id, {
        remainingPrincipal: loan.remainingPrincipal,
        totalPrincipalPaid: loan.totalPrincipalPaid,
        totalInterestPaid: loan.totalInterestPaid,
        totalPrepayment: loan.totalPrepayment,
        lastPaymentDate: loan.lastPaymentDate,
        nextPaymentDate: loan.nextPaymentDate,
        remainingMonths: loan.remainingMonths,
        monthlyPayment: loan.monthlyPayment,
        status: loan.status,
      });

      await queryRunner.commitTransaction();
      this.logger.log(`Payment processing completed successfully`);

      return savedPayment;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Failed to record payment: ${error.message}`, error.stack);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Make extra principal payment (outside regular schedule)
   * This reduces principal without following the monthly schedule
   */
  async makeExtraPrincipalPayment(
    loanId: string,
    userId: string,
    dto: ExtraPrincipalPaymentDto,
  ): Promise<{ success: boolean; newRemainingPrincipal: number }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      this.logger.log(`Making extra principal payment for loan ${loanId}, amount: ${dto.amount}`);

      // IMPORTANT: Load loan WITHOUT relations to avoid cascade issues when updating
      const loan = await queryRunner.manager.findOne(Loan, {
        where: { id: loanId, userId, deletedAt: null },
      });

      if (!loan) {
        throw new NotFoundException('Loan not found');
      }

      // Validation #1: Loan must be active
      if (loan.status !== LoanStatus.ACTIVE) {
        throw new BadRequestException('Cannot make payment for inactive loan');
      }

      // Validation #2: Check remaining principal
      if (loan.remainingPrincipal <= 0) {
        throw new BadRequestException('Loan is already paid off');
      }

      // Validation #3: Amount cannot exceed remaining principal
      if (dto.amount > loan.remainingPrincipal) {
        throw new BadRequestException(
          `Payment amount (${dto.amount}) cannot exceed remaining principal (${loan.remainingPrincipal})`,
        );
      }

      // Validate account
      const account = await queryRunner.manager.findOne(Account, {
        where: { id: dto.accountId, userId, deletedAt: null },
      });

      if (!account) {
        throw new NotFoundException('Account not found');
      }

      // Check sufficient balance
      if (account.balance < dto.amount) {
        throw new BadRequestException(
          `Insufficient account balance. Available: ${account.balance}, Required: ${dto.amount}`,
        );
      }

      // Get or create principal category
      let principalCategory: Category;
      if (dto.categoryId) {
        principalCategory = await queryRunner.manager.findOne(Category, {
          where: { id: dto.categoryId, userId, type: CategoryType.EXPENSE },
        });
        if (!principalCategory) {
          throw new BadRequestException('Category not found or not an expense category');
        }
      } else {
        // Auto-create default principal category
        principalCategory = await queryRunner.manager.findOne(Category, {
          where: { userId, type: CategoryType.EXPENSE, name: 'Trả nợ' },
        });
        if (!principalCategory) {
          principalCategory = queryRunner.manager.create(Category, {
            userId,
            name: 'Trả nợ',
            type: CategoryType.EXPENSE,
            icon: '💳',
            color: '#8B4513',
          });
          principalCategory = await queryRunner.manager.save(principalCategory);
        }
      }

      // Update account balance - round for VND
      account.balance = subtractVND(account.balance, dto.amount);
      await queryRunner.manager.save(account);

      // IMPORTANT: Create LoanPayment record BEFORE updating loan state
      // This allows us to revert the changes when deleting this prepayment
      const paymentResult = await queryRunner.manager
        .createQueryBuilder()
        .insert()
        .into(LoanPayment)
        .values({
          loanId: loan.id,
          paymentDate: new Date(dto.paymentDate),
          dueDate: null, // No due date for extra payments
          amount: roundVND(dto.amount),
          principalAmount: roundVND(dto.amount), // All goes to principal
          interestAmount: 0, // No interest for extra payment
          prepaymentAmount: roundVND(dto.amount),
          remainingPrincipal: subtractVND(loan.remainingPrincipal, dto.amount),
          status: PaymentStatus.PAID,
          isPrepayment: true,
          isScheduled: false,
          note: dto.note,
          previousRemainingMonths: loan.remainingMonths, // Save current state
          previousMonthlyPayment: loan.monthlyPayment, // Save current state
        })
        .execute();

      const savedPayment = await queryRunner.manager.findOne(LoanPayment, {
        where: { id: paymentResult.identifiers[0].id },
      });

      // Create transaction for principal payment
      const transaction = queryRunner.manager.create(Transaction, {
        userId,
        accountId: account.id,
        categoryId: principalCategory.id,
        type: TransactionType.EXPENSE,
        amount: dto.amount,
        date: new Date(dto.paymentDate),
        description: `Trả nợ gốc (ngoài lịch): ${loan.name}`,
        note: dto.note || 'Trả gốc tự do',
        loanId: loan.id,
        paymentId: savedPayment.id, // Link to payment record
      });
      await queryRunner.manager.save(transaction);

      // Update loan state
      const newRemainingPrincipal = Number(loan.remainingPrincipal) - dto.amount;
      loan.remainingPrincipal = newRemainingPrincipal;
      loan.totalPrincipalPaid = Number(loan.totalPrincipalPaid) + dto.amount;
      loan.totalPrepayment = Number(loan.totalPrepayment) + dto.amount;

      // SIMPLIFIED: Always use reduce_payment strategy
      // Keep remaining months unchanged, reduce monthly payment
      const monthlyRate = Number(loan.interestRate) / 100 / 12;

      if (newRemainingPrincipal > 0 && monthlyRate > 0) {
        // Formula: M = P × [r(1+r)^n] / [(1+r)^n - 1]
        const n = Number(loan.remainingMonths);
        const rPlusOne = 1 + monthlyRate;
        const rPlusOnePowerN = Math.pow(rPlusOne, n);

        const newMonthlyPayment = (newRemainingPrincipal * monthlyRate * rPlusOnePowerN) / (rPlusOnePowerN - 1);

        loan.monthlyPayment = Math.round(newMonthlyPayment);

        this.logger.log(
          `Extra principal payment: Monthly payment reduced to ${loan.monthlyPayment}, Remaining months unchanged: ${n}`,
        );
      }

      // If fully paid off, update status
      if (newRemainingPrincipal <= 0) {
        loan.status = LoanStatus.PAID_OFF;
        loan.remainingPrincipal = 0;
        loan.remainingMonths = 0;
        loan.monthlyPayment = 0;
      }

      // Save loan using update query to avoid cascade issues with loan_payments relation
      await queryRunner.manager
        .createQueryBuilder()
        .update(Loan)
        .set({
          remainingPrincipal: loan.remainingPrincipal,
          monthlyPayment: loan.monthlyPayment,
          totalPrincipalPaid: loan.totalPrincipalPaid,
          totalPrepayment: loan.totalPrepayment,
          status: loan.status,
          remainingMonths: loan.remainingMonths,
        })
        .where('id = :id', { id: loan.id })
        .execute();

      await queryRunner.commitTransaction();

      this.logger.log(`Extra principal payment successful. New remaining principal: ${newRemainingPrincipal}`);

      return {
        success: true,
        newRemainingPrincipal,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Failed to make extra principal payment: ${error.message}`, error.stack);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Get extra principal payment transactions for a loan
   * Returns transactions with paymentId = null (not linked to scheduled payments)
   */
  async getExtraPrincipalTransactions(loanId: string, userId: string) {
    // Verify loan ownership
    const loan = await this.loanRepository.findOne({
      where: { id: loanId, userId, deletedAt: null },
    });

    if (!loan) {
      throw new NotFoundException('Loan not found');
    }

    // Get transactions with no payment link
    const transactions = await this.transactionRepository.find({
      where: {
        loanId,
        paymentId: null, // Extra principal transactions don't have paymentId
        deletedAt: null,
      },
      relations: ['account', 'category'],
      order: { date: 'DESC' },
    });

    return {
      success: true,
      data: transactions.map((t) => ({
        id: t.id,
        amount: t.amount,
        date: t.date,
        note: t.note,
        description: t.description,
        accountId: t.accountId,
        accountName: t.account?.name,
        categoryId: t.categoryId,
        categoryName: t.category?.name,
        createdAt: t.createdAt,
      })),
    };
  }

  /**
   * Delete extra principal payment transaction
   * Reverses the transaction: restores account balance and loan principal
   */
  async deleteExtraPrincipalTransaction(loanId: string, transactionId: string, userId: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      this.logger.log(`Deleting extra principal transaction ${transactionId} for loan ${loanId}, user ${userId}`);

      // 1. Get loan
      const loan = await queryRunner.manager.findOne(Loan, {
        where: { id: loanId, userId, deletedAt: null },
      });

      if (!loan) {
        throw new NotFoundException('Loan not found');
      }

      // 2. Get transaction (can have paymentId or null for old transactions)
      const transaction = await queryRunner.manager.findOne(Transaction, {
        where: {
          id: transactionId,
          loanId,
          userId,
          deletedAt: null,
        },
        relations: ['account'],
      });

      if (!transaction) {
        throw new NotFoundException('Transaction not found or already deleted');
      }

      // 3. Validate it's an expense transaction
      if (transaction.type !== TransactionType.EXPENSE) {
        throw new BadRequestException('Transaction is not an expense');
      }

      // 4. Check if transaction has associated payment record
      let payment: LoanPayment | null = null;
      if (transaction.paymentId) {
        payment = await queryRunner.manager.findOne(LoanPayment, {
          where: { id: transaction.paymentId, loanId },
        });
      }

      // 5. If transaction is linked to a payment, use deletePayment instead
      if (payment) {
        this.logger.log(`Transaction has payment_id, redirecting to deletePayment: ${payment.id}`);

        // Rollback and release current transaction before calling deletePayment
        await queryRunner.rollbackTransaction();
        await queryRunner.release();

        // Call deletePayment which has proper restore logic
        await this.deletePayment(loanId, payment.id, userId);
        return; // Return void as per method signature
      }

      // 6. For old transactions without payment_id (legacy data):
      // We cannot safely restore loan state without saved previous values
      // Warn user that this is a legacy transaction
      this.logger.warn(
        `Deleting legacy transaction without payment record. Cannot restore exact loan state. Transaction: ${transactionId}`,
      );

      // 7. Restore account balance - round for VND
      const account = transaction.account;
      account.balance = addVND(account.balance, transaction.amount);
      await queryRunner.manager.save(account);

      // 8. Restore loan principal (best effort) - round for VND
      loan.remainingPrincipal = addVND(loan.remainingPrincipal, transaction.amount);
      loan.totalPrincipalPaid = Math.max(0, subtractVND(loan.totalPrincipalPaid, transaction.amount));
      loan.totalPrepayment = Math.max(0, subtractVND(loan.totalPrepayment, transaction.amount));

      // 9. For legacy transactions, we can only estimate remainingMonths
      // This is NOT accurate but better than doing nothing
      // Recommend user to delete the entire loan and recreate if state is corrupted
      const restoredPrincipal = loan.remainingPrincipal;
      if (restoredPrincipal > 0 && Number(loan.monthlyPayment) > 0) {
        const monthlyRate = Number(loan.interestRate) / 100 / 12;
        const payment = Number(loan.monthlyPayment);

        if (monthlyRate > 0) {
          const factor = 1 - (restoredPrincipal * monthlyRate) / payment;

          if (factor > 0 && factor <= 1) {
            const estimatedMonths = Math.ceil(-Math.log(factor) / Math.log(1 + monthlyRate));
            // Clamp to termMonths to avoid exceeding original term
            loan.remainingMonths = Math.min(Number(loan.termMonths), Math.max(0, estimatedMonths));

            this.logger.warn(
              `Estimated remaining months for legacy transaction: ${loan.remainingMonths} (clamped to termMonths: ${loan.termMonths})`,
            );
          }
        }
      }

      // If loan was paid off, revert to active
      if (loan.status === LoanStatus.PAID_OFF) {
        loan.status = LoanStatus.ACTIVE;
      }

      await queryRunner.manager.save(loan);

      // 10. Soft delete transaction
      transaction.deletedAt = new Date();
      await queryRunner.manager.save(transaction);

      await queryRunner.commitTransaction();

      this.logger.log(
        `Legacy transaction deleted. Restored principal: ${transaction.amount}. ` +
          `Warning: Loan state may not be exact - consider recreating loan if data is corrupted.`,
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Failed to delete extra principal transaction: ${error.message}`, error.stack);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Delete a loan payment (with full rollback of all changes)
   * Only allows deleting the most recent payment to maintain data integrity
   */
  async deletePayment(loanId: string, paymentId: string, userId: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      this.logger.log(`Deleting payment ${paymentId} for loan ${loanId}, user ${userId}`);

      // 1. Get loan
      const loan = await queryRunner.manager.findOne(Loan, {
        where: { id: loanId, userId, deletedAt: null },
      });

      if (!loan) {
        throw new NotFoundException('Loan not found');
      }

      // 2. Get payment
      const payment = await queryRunner.manager.findOne(LoanPayment, {
        where: { id: paymentId, loanId },
      });

      if (!payment) {
        throw new NotFoundException('Payment not found');
      }

      // 3. Get most recent payment to ensure we only delete the latest
      // Sort by createdAt DESC to handle multiple payments on same date
      const mostRecentPayment = await queryRunner.manager.findOne(LoanPayment, {
        where: { loanId },
        order: { createdAt: 'DESC' },
      });

      if (!mostRecentPayment) {
        throw new NotFoundException('No payments found for this loan');
      }

      if (mostRecentPayment.id !== paymentId) {
        throw new BadRequestException(
          'Can only delete the most recent payment. Please delete payments in reverse chronological order.',
        );
      }

      // 4. Find all transactions linked to this payment by paymentId
      const transactions = await queryRunner.manager
        .createQueryBuilder(Transaction, 'transaction')
        .where('transaction.paymentId = :paymentId', { paymentId })
        .andWhere('transaction.userId = :userId', { userId })
        .andWhere('transaction.deletedAt IS NULL')
        .getMany();

      this.logger.log(`Found ${transactions.length} transactions to delete for payment ${paymentId}`);

      // 5. Revert account balance if transactions exist
      if (transactions.length > 0) {
        const accountId = transactions[0].accountId;
        const account = await queryRunner.manager.findOne(Account, {
          where: { id: accountId, userId },
        });

        if (account) {
          // Add back the total amount (since it was deducted during payment)
          const totalAmount = Number(payment.amount);
          const currentBalance = Number(account.balance);
          const newBalance = currentBalance + totalAmount;

          await queryRunner.manager.update(Account, account.id, { balance: newBalance });

          this.logger.log(`Reverted account balance: ${currentBalance} + ${totalAmount} = ${newBalance}`);
        }

        // 6. Soft delete all transactions using raw query
        const transactionIds = transactions.map((t) => t.id);
        await queryRunner.manager
          .createQueryBuilder()
          .update(Transaction)
          .set({ deletedAt: new Date() })
          .whereInIds(transactionIds)
          .execute();

        this.logger.log(`Soft deleted ${transactions.length} transactions`);
      }

      // 7. Revert loan state
      const principalPaid = Number(payment.principalAmount);
      const interestPaid = Number(payment.interestAmount);
      const prepaymentAmount = Number(payment.prepaymentAmount) || 0;

      // Store current values for logging
      const currentRemainingPrincipal = Number(loan.remainingPrincipal);
      const currentRemainingMonths = loan.remainingMonths;
      const currentMonthlyPayment = Number(loan.monthlyPayment);

      // Restore principal
      loan.remainingPrincipal = Number(loan.remainingPrincipal) + principalPaid;
      loan.totalPrincipalPaid = Math.max(0, Number(loan.totalPrincipalPaid) - principalPaid);
      loan.totalInterestPaid = Math.max(0, Number(loan.totalInterestPaid) - interestPaid);
      loan.totalPrepayment = Math.max(0, Number(loan.totalPrepayment) - prepaymentAmount);

      // Revert next payment date (subtract 1 month)
      const nextDate = new Date(loan.nextPaymentDate);
      nextDate.setMonth(nextDate.getMonth() - 1);
      loan.nextPaymentDate = nextDate;

      // Restore remainingMonths and monthlyPayment from saved values
      if (payment.previousRemainingMonths != null) {
        loan.remainingMonths = payment.previousRemainingMonths;
        this.logger.log(`Restored remainingMonths from payment record: ${loan.remainingMonths}`);
      } else {
        // Fallback if previousRemainingMonths not available (old records)
        loan.remainingMonths = currentRemainingMonths + 1;
        this.logger.log(`previousRemainingMonths not available, using fallback: ${loan.remainingMonths}`);
      }

      if (payment.previousMonthlyPayment != null) {
        loan.monthlyPayment = Number(payment.previousMonthlyPayment);
        this.logger.log(`Restored monthlyPayment from payment record: ${loan.monthlyPayment}`);
      }

      this.logger.log(
        `Reverted loan state: ` +
          `remainingPrincipal ${currentRemainingPrincipal} -> ${loan.remainingPrincipal}, ` +
          `remainingMonths ${currentRemainingMonths} -> ${loan.remainingMonths}, ` +
          `monthlyPayment ${currentMonthlyPayment} -> ${loan.monthlyPayment}`,
      );

      // If loan was PAID_OFF, revert to ACTIVE
      if (loan.status === LoanStatus.PAID_OFF) {
        loan.status = LoanStatus.ACTIVE;
        this.logger.log('Reverted loan status from PAID_OFF to ACTIVE');
      }

      // Find last payment date (excluding this one)
      const allPayments = await queryRunner.manager.find(LoanPayment, {
        where: { loanId },
        order: { paymentDate: 'DESC' },
        take: 2, // Get top 2 to find the previous one
      });

      const previousPayment = allPayments.length > 1 ? allPayments[1] : null;
      loan.lastPaymentDate = previousPayment ? previousPayment.paymentDate : null;

      // Update loan
      await queryRunner.manager.update(Loan, loan.id, {
        remainingPrincipal: loan.remainingPrincipal,
        totalPrincipalPaid: loan.totalPrincipalPaid,
        totalInterestPaid: loan.totalInterestPaid,
        totalPrepayment: loan.totalPrepayment,
        lastPaymentDate: loan.lastPaymentDate,
        nextPaymentDate: loan.nextPaymentDate,
        remainingMonths: loan.remainingMonths,
        monthlyPayment: loan.monthlyPayment,
        status: loan.status,
      });

      // 8. Hard delete payment (LoanPayment doesn't have soft delete)
      await queryRunner.manager.delete(LoanPayment, paymentId);

      await queryRunner.commitTransaction();
      this.logger.log(`Payment deletion completed successfully`);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Failed to delete payment: ${error.message}`, error.stack);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
