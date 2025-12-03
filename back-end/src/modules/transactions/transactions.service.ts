import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindOptionsWhere, IsNull, Repository } from 'typeorm';
import { TransactionType } from '../../common/constants/enums';
import { Account } from '../../entities/account.entity';
import { Goal } from '../../entities/goal.entity';
import { Loan } from '../../entities/loan.entity';
import { Transaction } from '../../entities/transaction.entity';
import { CreateTransactionDto, QueryTransactionDto, UpdateTransactionDto } from './dto';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    @InjectRepository(Goal)
    private readonly goalRepository: Repository<Goal>,
    @InjectRepository(Loan)
    private readonly loanRepository: Repository<Loan>,
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

    // Validate category for non-transfer transactions (except for debt/event related transactions)
    const isRelatedTransaction = rest.debtId || rest.eventId;
    if (type !== TransactionType.TRANSFER && !categoryId && !isRelatedTransaction) {
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

      // Load transaction with relations before returning
      const transactionWithRelations = await transactionalEntityManager.findOne(Transaction, {
        where: { id: savedTransaction.id },
        relations: ['account', 'category', 'toAccount', 'event'],
      });

      return transactionWithRelations || savedTransaction;
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
      sortBy = 'createdAt',
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

    // Sorting - sort by date (transaction date), then by createdAt for consistency
    const sortField = sortBy === 'date' ? 'transaction.date' : `transaction.${sortBy}`;
    queryBuilder.orderBy(sortField, sortOrder);
    // Secondary sort by createdAt to ensure consistent ordering for same-date transactions
    queryBuilder.addOrderBy('transaction.createdAt', 'DESC');

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

        // If transaction is linked to a goal and amount changed, update goal's current_amount
        if (transaction.goalId && amountChanged) {
          const goal = await transactionalEntityManager.findOne(Goal, {
            where: { id: transaction.goalId, userId },
          });

          if (goal) {
            // Revert old amount impact
            const oldAdjustment =
              transaction.type === TransactionType.EXPENSE
                ? -transaction.amount // Remove old contribution
                : transaction.amount; // Remove old withdrawal

            // Apply new amount impact
            const newAdjustment =
              (type || transaction.type) === TransactionType.EXPENSE
                ? amount // Add new contribution
                : -amount; // Add new withdrawal

            goal.currentAmount = Number(goal.currentAmount) + oldAdjustment + newAdjustment;

            // Ensure currentAmount doesn't go negative
            if (goal.currentAmount < 0) {
              goal.currentAmount = 0;
            }

            await transactionalEntityManager.save(Goal, goal);
          }
        }

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

        // Load transaction with relations before returning
        const transactionWithRelations = await transactionalEntityManager.findOne(Transaction, {
          where: { id: updatedTransaction.id },
          relations: ['account', 'category', 'toAccount', 'event'],
        });

        return transactionWithRelations || updatedTransaction;
      });
    }

    // Simple update (no balance change)
    Object.assign(transaction, rest);
    const updated = await this.transactionRepository.save(transaction);

    // Load relations for simple update too
    return await this.findOne(userId, updated.id);
  }

  /**
   * Delete a transaction (soft delete)
   */
  async remove(userId: string, id: string): Promise<void> {
    const transaction = await this.findOne(userId, id);

    // Check if this is a loan disbursement transaction using loanId
    if (transaction.loanId) {
      // Check if loan still exists
      const loan = await this.loanRepository.findOne({
        where: { id: transaction.loanId, deletedAt: IsNull() },
      });

      if (loan) {
        throw new BadRequestException(
          'Cannot delete loan disbursement transaction. This transaction is linked to an active loan. ' +
            'Please delete the loan first or contact administrator.',
        );
      }
    }

    await this.transactionRepository.manager.transaction(async (transactionalEntityManager) => {
      // Revert transaction impact on balance
      if (transaction.type === TransactionType.TRANSFER) {
        // Special handling for TRANSFER: reverse both accounts
        await this.revertTransferBalance(
          transactionalEntityManager,
          transaction.accountId,
          transaction.amount,
          transaction.toAccountId,
        );
      } else {
        // Normal transaction: use reversed type
        await this.updateAccountBalance(
          transactionalEntityManager,
          transaction.accountId,
          this.getReversedType(transaction.type),
          transaction.amount,
          transaction.toAccountId,
        );
      }

      // If transaction is linked to a goal, update goal's current_amount
      if (transaction.goalId) {
        const goal = await transactionalEntityManager.findOne(Goal, {
          where: { id: transaction.goalId, userId },
        });

        if (goal) {
          // Since we're deleting a contribution (expense), we need to decrease current_amount
          // If it was a withdrawal (income), we need to increase current_amount back
          const adjustmentAmount =
            transaction.type === TransactionType.EXPENSE
              ? -transaction.amount // Subtract contribution
              : transaction.amount; // Add back withdrawal

          goal.currentAmount = Number(goal.currentAmount) + adjustmentAmount;

          // Ensure currentAmount doesn't go negative
          if (goal.currentAmount < 0) {
            goal.currentAmount = 0;
          }

          await transactionalEntityManager.save(Goal, goal);
        }
      }

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
    } else if (type === TransactionType.EXPENSE) {
      account.balance = Number(account.balance) - Number(amount);
    } else if (type === TransactionType.TRANSFER) {
      // For TRANSFER: subtract from source account (when creating/deleting needs reversal)
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
   * Revert transfer balance when deleting a transfer transaction
   * This adds money back to fromAccount and subtracts from toAccount
   */
  private async revertTransferBalance(
    transactionalEntityManager: any,
    fromAccountId: string,
    amount: number,
    toAccountId?: string,
  ): Promise<void> {
    // Add money back to source account
    const fromAccount = await transactionalEntityManager.findOne(Account, {
      where: { id: fromAccountId },
    });

    if (!fromAccount) {
      throw new NotFoundException('From account not found');
    }

    fromAccount.balance = Number(fromAccount.balance) + Number(amount);
    await transactionalEntityManager.save(Account, fromAccount);

    // Subtract money from destination account
    if (toAccountId) {
      const toAccount = await transactionalEntityManager.findOne(Account, {
        where: { id: toAccountId },
      });

      if (!toAccount) {
        throw new NotFoundException('To account not found');
      }

      toAccount.balance = Number(toAccount.balance) - Number(amount);
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
