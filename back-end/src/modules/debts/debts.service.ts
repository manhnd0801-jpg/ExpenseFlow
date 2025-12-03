import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DebtStatus, DebtType, PaymentStatus, TransactionType } from '../../common/constants/enums';
import { DebtPayment } from '../../entities/debt-payment.entity';
import { Debt } from '../../entities/debt.entity';
import { AccountsService } from '../accounts/accounts.service';
import { CreateTransactionDto } from '../transactions/dto/create-transaction.dto';
import { TransactionsService } from '../transactions/transactions.service';
import { CreateDebtDto, RecordDebtPaymentDto, UpdateDebtDto } from './dto';

@Injectable()
export class DebtsService {
  private readonly logger = new Logger(DebtsService.name);

  constructor(
    @InjectRepository(Debt)
    private readonly debtRepository: Repository<Debt>,
    @InjectRepository(DebtPayment)
    private readonly debtPaymentRepository: Repository<DebtPayment>,
    private readonly accountsService: AccountsService,
    private readonly transactionsService: TransactionsService,
  ) {}

  async create(userId: string, dto: CreateDebtDto): Promise<Debt> {
    this.logger.log(`Creating debt for user ${userId}, type: ${dto.type}, amount: ${dto.amount}`);

    // Validate account exists and belongs to user (if provided)
    if (dto.accountId) {
      const account = await this.accountsService.findOne(userId, dto.accountId);
      if (!account) {
        throw new BadRequestException('Account not found or does not belong to user');
      }
    }

    return await this.debtRepository.manager.transaction(async (manager) => {
      // Step 1: Create the debt record
      const debt = manager.create(Debt, {
        userId,
        type: dto.type,
        personName: dto.personName,
        contactInfo: dto.contactInfo,
        originalAmount: dto.amount,
        remainingAmount: dto.amount,
        interestRate: dto.interestRate ?? 0,
        borrowedDate: dto.borrowedDate,
        dueDate: dto.dueDate,
        status: DebtStatus.ACTIVE,
        description: dto.description,
        accountId: dto.accountId,
        totalInterestPaid: 0,
      });
      const savedDebt = await manager.save(Debt, debt);

      // Step 2: Create initial transaction (only if accountId is provided)
      if (dto.accountId) {
        const transactionType =
          dto.type === DebtType.LENDING
            ? TransactionType.EXPENSE // Money going out (lending to someone)
            : TransactionType.INCOME; // Money coming in (borrowing from someone)

        const description =
          dto.type === DebtType.LENDING
            ? `Cho vay: ${dto.personName} - ${dto.amount.toLocaleString('vi-VN')} VND`
            : `Vay nợ: ${dto.personName} - ${dto.amount.toLocaleString('vi-VN')} VND`;

        const transactionDto: CreateTransactionDto = {
          accountId: dto.accountId,
          categoryId: dto.categoryId,
          type: transactionType,
          amount: dto.amount,
          date: dto.borrowedDate,
          description,
          note: dto.description,
          debtId: savedDebt.id,
        };

        const transaction = await this.transactionsService.create(userId, transactionDto);
        this.logger.log(`Created initial transaction ${transaction.id} for debt ${savedDebt.id}`);

        // Step 3: Update debt with initial transaction reference
        savedDebt.initialTransactionId = transaction.id;
        await manager.save(Debt, savedDebt);
      }

      this.logger.log(`Successfully created debt ${savedDebt.id} with initial transaction`);
      return savedDebt;
    });
  }

  async findAll(userId: string, type?: number): Promise<Debt[]> {
    const where: any = { userId };
    if (type) where.type = type;
    return await this.debtRepository.find({
      where,
      relations: ['payments', 'account', 'initialTransaction'],
      order: { updatedAt: 'DESC' },
    });
  }

  async findOne(userId: string, id: string): Promise<Debt> {
    const debt = await this.debtRepository.findOne({
      where: { id, userId },
      relations: ['payments', 'account', 'initialTransaction'],
    });
    if (!debt) throw new NotFoundException('Debt not found');
    return debt;
  }

  async update(userId: string, id: string, dto: UpdateDebtDto): Promise<Debt> {
    const debt = await this.findOne(userId, id);

    // Map DTO fields to entity fields
    if (dto.personName !== undefined) debt.personName = dto.personName;
    if (dto.amount !== undefined) {
      debt.originalAmount = dto.amount; // Map DTO amount -> entity originalAmount
      // Recalculate remaining amount based on payments
      const payments = await this.debtPaymentRepository.find({ where: { debtId: id } });
      const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);
      debt.remainingAmount = dto.amount - totalPaid;
    }
    if (dto.interestRate !== undefined) debt.interestRate = dto.interestRate;
    if (dto.dueDate !== undefined) debt.dueDate = dto.dueDate;
    if (dto.description !== undefined) debt.description = dto.description;
    if (dto.contactInfo !== undefined) debt.contactInfo = dto.contactInfo;

    return await this.debtRepository.save(debt);
  }

  async remove(userId: string, id: string): Promise<void> {
    await this.findOne(userId, id);
    await this.debtRepository.softDelete(id);
  }

  async recordPayment(userId: string, debtId: string, dto: RecordDebtPaymentDto): Promise<DebtPayment> {
    this.logger.log(`Recording payment for debt ${debtId}, amount: ${dto.amount}`);

    const debt = await this.findOne(userId, debtId);

    // Validate account exists and belongs to user (if provided)
    if (dto.accountId) {
      const account = await this.accountsService.findOne(userId, dto.accountId);
      if (!account) {
        throw new BadRequestException('Payment account not found or does not belong to user');
      }
    }

    // Validate payment amount doesn't exceed remaining debt
    if (dto.principalAmount > debt.remainingAmount) {
      throw new BadRequestException('Principal amount cannot exceed remaining debt amount');
    }

    return await this.debtRepository.manager.transaction(async (manager) => {
      // Step 1: Create the payment record
      const payment = manager.create(DebtPayment, {
        debtId,
        amount: dto.amount,
        principalAmount: dto.principalAmount,
        interestAmount: dto.interestAmount,
        accountId: dto.accountId,
        paymentDate: dto.paymentDate,
        method: dto.method,
        reference: dto.reference,
        note: dto.note,
        status: PaymentStatus.PAID,
      });
      const savedPayment = await manager.save(DebtPayment, payment);

      // Step 2: Create transaction for this payment (only if accountId is provided)
      if (dto.accountId) {
        const transactionType =
          debt.type === DebtType.LENDING
            ? TransactionType.INCOME // Money coming in (receiving payment from borrower)
            : TransactionType.EXPENSE; // Money going out (paying back lender)

        const description =
          debt.type === DebtType.LENDING
            ? `Thu nợ: ${debt.personName} - ${dto.amount.toLocaleString('vi-VN')} VND`
            : `Trả nợ: ${debt.personName} - ${dto.amount.toLocaleString('vi-VN')} VND`;

        const transactionNote =
          dto.interestAmount > 0
            ? `${dto.principalAmount.toLocaleString('vi-VN')} gốc + ${dto.interestAmount.toLocaleString('vi-VN')} lãi. ${dto.note || ''}`
            : dto.note;

        const transactionDto: CreateTransactionDto = {
          accountId: dto.accountId,
          categoryId: dto.categoryId,
          type: transactionType,
          amount: dto.amount,
          date: dto.paymentDate,
          description,
          note: transactionNote,
          debtId: debt.id,
          reference: dto.reference,
        };

        const transaction = await this.transactionsService.create(userId, transactionDto);
        this.logger.log(`Created payment transaction ${transaction.id} for debt payment ${savedPayment.id}`);

        // Step 3: Update payment with transaction reference
        savedPayment.transactionId = transaction.id;
        await manager.save(DebtPayment, savedPayment);
      }

      // Step 4: Update debt balances and status
      debt.remainingAmount = Number(debt.remainingAmount) - Number(dto.principalAmount);
      debt.totalInterestPaid = Number(debt.totalInterestPaid) + Number(dto.interestAmount);

      if (debt.remainingAmount <= 0) {
        debt.remainingAmount = 0;
        debt.status = DebtStatus.COMPLETED;
      } else {
        debt.status = DebtStatus.PARTIAL_PAID;
      }

      // Check if overdue and update status
      if (debt.dueDate && new Date() > debt.dueDate && debt.status !== DebtStatus.COMPLETED) {
        debt.status = DebtStatus.OVERDUE;
      }

      await manager.save(Debt, debt);

      this.logger.log(`Successfully recorded payment for debt ${debtId}. Remaining: ${debt.remainingAmount}`);
      return savedPayment;
    });
  }

  async getPayments(userId: string, debtId: string): Promise<DebtPayment[]> {
    await this.findOne(userId, debtId);
    return await this.debtPaymentRepository.find({
      where: { debtId },
      order: { paymentDate: 'DESC' },
      relations: ['transaction', 'account'],
    });
  }

  async deletePayment(userId: string, debtId: string, paymentId: string): Promise<void> {
    this.logger.log(`Attempting to delete payment ${paymentId} for debt ${debtId}`);

    const debt = await this.findOne(userId, debtId);
    const payment = await this.debtPaymentRepository.findOne({
      where: { id: paymentId, debtId },
      relations: ['transaction'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // Check 7-day rule
    const daysSincePayment = Math.floor((Date.now() - payment.createdAt.getTime()) / (1000 * 60 * 60 * 24));

    if (daysSincePayment > 7) {
      throw new BadRequestException('Cannot delete payment older than 7 days');
    }

    return await this.debtRepository.manager.transaction(async (manager) => {
      // Step 1: Delete the associated transaction (if exists)
      if (payment.transactionId && payment.transaction) {
        await this.transactionsService.remove(userId, payment.transactionId);
        this.logger.log(`Deleted associated transaction ${payment.transactionId}`);
      }

      // Step 2: Rollback debt balances
      debt.remainingAmount = Number(debt.remainingAmount) + Number(payment.principalAmount);
      debt.totalInterestPaid = Number(debt.totalInterestPaid) - Number(payment.interestAmount);

      // Update status based on new remaining amount
      if (debt.remainingAmount >= debt.originalAmount) {
        debt.status = DebtStatus.ACTIVE;
      } else if (debt.remainingAmount > 0) {
        debt.status = DebtStatus.PARTIAL_PAID;
      }

      // Check if overdue
      if (debt.dueDate && new Date() > debt.dueDate && debt.remainingAmount > 0) {
        debt.status = DebtStatus.OVERDUE;
      }

      await manager.save(Debt, debt);

      // Step 3: Delete the payment record
      await manager.remove(DebtPayment, payment);

      this.logger.log(`Successfully deleted payment ${paymentId} and rolled back debt balances`);
    });
  }

  async getSummary(userId: string): Promise<any> {
    const [lendingDebts, borrowingDebts] = await Promise.all([
      this.debtRepository.find({
        where: { userId, type: DebtType.LENDING },
        relations: ['account'],
      }),
      this.debtRepository.find({
        where: { userId, type: DebtType.BORROWING },
        relations: ['account'],
      }),
    ]);

    const calculateSummary = (debts: Debt[]) => ({
      total: debts.length,
      active: debts.filter((d) => d.status === DebtStatus.ACTIVE).length,
      partial: debts.filter((d) => d.status === DebtStatus.PARTIAL_PAID).length,
      completed: debts.filter((d) => d.status === DebtStatus.COMPLETED).length,
      overdue: debts.filter((d) => d.status === DebtStatus.OVERDUE).length,
      totalAmount: debts.reduce((sum, d) => sum + Number(d.originalAmount), 0),
      remainingAmount: debts.reduce((sum, d) => sum + Number(d.remainingAmount), 0),
      totalInterestPaid: debts.reduce((sum, d) => sum + Number(d.totalInterestPaid || 0), 0),
    });

    return {
      lending: calculateSummary(lendingDebts),
      borrowing: calculateSummary(borrowingDebts),
      overallBalance:
        lendingDebts.reduce((sum, d) => sum + Number(d.remainingAmount), 0) -
        borrowingDebts.reduce((sum, d) => sum + Number(d.remainingAmount), 0),
    };
  }
}
