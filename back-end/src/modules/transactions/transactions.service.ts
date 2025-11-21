import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindOptionsWhere, Repository } from 'typeorm';
import { TransactionType } from '../../common/constants/enums';
import { Account } from '../../entities/account.entity';
import { Transaction } from '../../entities/transaction.entity';
import { CreateTransactionDto, QueryTransactionDto, UpdateTransactionDto } from './dto';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
  ) {}

  /**
   * Create a new transaction and update account balance
   */
  async create(userId: string, createTransactionDto: CreateTransactionDto): Promise<Transaction> {
    const { accountId, toAccountId, type, amount, categoryId, ...rest } = createTransactionDto;

    // Validate account ownership
    const account = await this.validateAccountOwnership(userId, accountId);

    // Validate transfer transactions
    if (type === TransactionType.TRANSFER) {
      if (!toAccountId) {
        throw new BadRequestException('toAccountId is required for transfer transactions');
      }
      await this.validateAccountOwnership(userId, toAccountId);
    } else if (toAccountId) {
      throw new BadRequestException('toAccountId should only be provided for transfer transactions');
    }

    // Validate category for non-transfer transactions
    if (type !== TransactionType.TRANSFER && !categoryId) {
      throw new BadRequestException('categoryId is required for income and expense transactions');
    }

    // Check sufficient balance for expenses and transfers
    if (type === TransactionType.EXPENSE || type === TransactionType.TRANSFER) {
      if (account.balance < amount) {
        throw new BadRequestException('Insufficient account balance');
      }
    }

    // Create transaction using transaction
    return await this.transactionRepository.manager.transaction(async (transactionalEntityManager) => {
      // Create transaction record
      const transaction = this.transactionRepository.create({
        userId,
        accountId,
        toAccountId,
        categoryId,
        type,
        amount,
        ...rest,
      });

      const savedTransaction = await transactionalEntityManager.save(Transaction, transaction);

      // Update account balances
      await this.updateAccountBalance(transactionalEntityManager, accountId, type, amount, toAccountId);

      return savedTransaction;
    });
  }

  /**
   * Find all transactions with filters and pagination
   */
  async findAll(userId: string, queryDto: QueryTransactionDto): Promise<{ data: Transaction[]; total: number }> {
    const {
      page = 1,
      limit = 20,
      type,
      categoryId,
      accountId,
      eventId,
      startDate,
      endDate,
      search,
      sortBy = 'date',
      sortOrder = 'DESC',
    } = queryDto;

    const where: FindOptionsWhere<Transaction> = { userId };

    // Apply filters
    if (type) where.type = type;
    if (categoryId) where.categoryId = categoryId;
    if (accountId) where.accountId = accountId;
    if (eventId) where.eventId = eventId;

    // Date range filter
    if (startDate || endDate) {
      where.date = Between(
        startDate ? new Date(startDate) : new Date('1970-01-01'),
        endDate ? new Date(endDate) : new Date(),
      );
    }

    const queryBuilder = this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.account', 'account')
      .leftJoinAndSelect('transaction.category', 'category')
      .leftJoinAndSelect('transaction.toAccount', 'toAccount')
      .leftJoinAndSelect('transaction.event', 'event')
      .where(where);

    // Search filter
    if (search) {
      queryBuilder.andWhere('(transaction.description ILIKE :search OR transaction.note ILIKE :search)', {
        search: `%${search}%`,
      });
    }

    // Sorting
    const sortField = sortBy === 'date' ? 'transaction.date' : `transaction.${sortBy}`;
    queryBuilder.orderBy(sortField, sortOrder);

    // Pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return { data, total };
  }

  /**
   * Find one transaction by ID
   */
  async findOne(userId: string, id: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOne({
      where: { id, userId },
      relations: ['account', 'category', 'toAccount', 'event', 'user'],
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
  }

  /**
   * Update a transaction
   */
  async update(userId: string, id: string, updateTransactionDto: UpdateTransactionDto): Promise<Transaction> {
    const transaction = await this.findOne(userId, id);

    const { accountId, toAccountId, type, amount, ...rest } = updateTransactionDto;

    // If amount or type changed, need to recalculate balances
    const amountChanged = amount && amount !== transaction.amount;
    const typeChanged = type && type !== transaction.type;
    const accountChanged = accountId && accountId !== transaction.accountId;

    if (amountChanged || typeChanged || accountChanged) {
      return await this.transactionRepository.manager.transaction(async (transactionalEntityManager) => {
        // Revert old transaction impact on balance
        await this.updateAccountBalance(
          transactionalEntityManager,
          transaction.accountId,
          this.getReversedType(transaction.type),
          transaction.amount,
          transaction.toAccountId,
        );

        // Update transaction
        Object.assign(transaction, {
          accountId: accountId || transaction.accountId,
          toAccountId: toAccountId !== undefined ? toAccountId : transaction.toAccountId,
          type: type || transaction.type,
          amount: amount || transaction.amount,
          ...rest,
        });

        const updatedTransaction = await transactionalEntityManager.save(Transaction, transaction);

        // Apply new transaction impact on balance
        await this.updateAccountBalance(
          transactionalEntityManager,
          updatedTransaction.accountId,
          updatedTransaction.type,
          updatedTransaction.amount,
          updatedTransaction.toAccountId,
        );

        return updatedTransaction;
      });
    }

    // Simple update (no balance change)
    Object.assign(transaction, rest);
    return await this.transactionRepository.save(transaction);
  }

  /**
   * Delete a transaction (soft delete)
   */
  async remove(userId: string, id: string): Promise<void> {
    const transaction = await this.findOne(userId, id);

    await this.transactionRepository.manager.transaction(async (transactionalEntityManager) => {
      // Revert transaction impact on balance
      await this.updateAccountBalance(
        transactionalEntityManager,
        transaction.accountId,
        this.getReversedType(transaction.type),
        transaction.amount,
        transaction.toAccountId,
      );

      // Soft delete
      await transactionalEntityManager.softDelete(Transaction, id);
    });
  }

  /**
   * Get transaction summary for a period
   */
  async getSummary(userId: string, startDate?: string, endDate?: string, accountId?: string): Promise<any> {
    const where: FindOptionsWhere<Transaction> = { userId };

    if (accountId) where.accountId = accountId;

    if (startDate || endDate) {
      where.date = Between(
        startDate ? new Date(startDate) : new Date('1970-01-01'),
        endDate ? new Date(endDate) : new Date(),
      );
    }

    const transactions = await this.transactionRepository.find({
      where,
      relations: ['category'],
    });

    const totalIncome = transactions
      .filter((t) => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpense = transactions
      .filter((t) => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const balance = totalIncome - totalExpense;

    // Group by category
    const expenseByCategory = transactions
      .filter((t) => t.type === TransactionType.EXPENSE && t.category)
      .reduce(
        (acc, t) => {
          const categoryId = t.categoryId!;
          if (!acc[categoryId]) {
            acc[categoryId] = {
              categoryId,
              categoryName: t.category!.name,
              amount: 0,
              transactionCount: 0,
            };
          }
          acc[categoryId].amount += Number(t.amount);
          acc[categoryId].transactionCount += 1;
          return acc;
        },
        {} as Record<string, any>,
      );

    const expenseByCategoryArray = Object.values(expenseByCategory).map((item: any) => ({
      ...item,
      percentage: totalExpense > 0 ? (item.amount / totalExpense) * 100 : 0,
    }));

    return {
      totalIncome,
      totalExpense,
      balance,
      transactionCount: transactions.length,
      expenseByCategory: expenseByCategoryArray,
    };
  }

  /**
   * Validate account ownership
   */
  private async validateAccountOwnership(userId: string, accountId: string): Promise<Account> {
    const account = await this.accountRepository.findOne({
      where: { id: accountId, userId },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    return account;
  }

  /**
   * Update account balance based on transaction
   */
  private async updateAccountBalance(
    transactionalEntityManager: any,
    accountId: string,
    type: number,
    amount: number,
    toAccountId?: string,
  ): Promise<void> {
    const account = await transactionalEntityManager.findOne(Account, {
      where: { id: accountId },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    // Update from account balance
    if (type === TransactionType.INCOME) {
      account.balance = Number(account.balance) + Number(amount);
    } else if (type === TransactionType.EXPENSE || type === TransactionType.TRANSFER) {
      account.balance = Number(account.balance) - Number(amount);
    }

    await transactionalEntityManager.save(Account, account);

    // Update to account balance for transfers
    if (type === TransactionType.TRANSFER && toAccountId) {
      const toAccount = await transactionalEntityManager.findOne(Account, {
        where: { id: toAccountId },
      });

      if (!toAccount) {
        throw new NotFoundException('To account not found');
      }

      toAccount.balance = Number(toAccount.balance) + Number(amount);
      await transactionalEntityManager.save(Account, toAccount);
    }
  }

  /**
   * Get reversed transaction type (for reverting balance changes)
   */
  private getReversedType(type: number): number {
    if (type === TransactionType.INCOME) return TransactionType.EXPENSE;
    if (type === TransactionType.EXPENSE) return TransactionType.INCOME;
    return type; // Transfer reverses itself
  }
}
