import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, IsNull, Repository } from 'typeorm';
import { CategoryType, GoalStatus, TransactionType } from '../../common/constants/enums';
import { Account } from '../../entities/account.entity';
import { Category } from '../../entities/category.entity';
import { GoalTransaction } from '../../entities/goal-transaction.entity';
import { Goal } from '../../entities/goal.entity';
import { Transaction } from '../../entities/transaction.entity';
import { ContributeGoalDto, CreateGoalDto, DeleteGoalDto, UpdateGoalDto, WithdrawGoalDto } from './dto';

@Injectable()
export class GoalsService {
  constructor(
    @InjectRepository(Goal)
    private readonly goalRepository: Repository<Goal>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(GoalTransaction)
    private readonly goalTransactionRepository: Repository<GoalTransaction>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly dataSource: DataSource,
  ) {}

  async create(userId: string, dto: CreateGoalDto): Promise<Goal> {
    const goal = this.goalRepository.create({
      ...dto,
      userId,
      currentAmount: dto.currentAmount || 0,
      status: GoalStatus.ACTIVE,
    });
    return await this.goalRepository.save(goal);
  }

  async findAll(userId: string): Promise<Goal[]> {
    return await this.goalRepository.find({
      where: { userId },
      order: { updatedAt: 'DESC' },
    });
  }

  async findOne(userId: string, id: string): Promise<Goal> {
    console.log('🔍 FindOne Goal:', { userId, id });
    const goal = await this.goalRepository.findOne({ where: { id, userId } });
    console.log('🔍 FindOne Result:', goal ? 'FOUND' : 'NOT_FOUND');
    if (!goal) throw new NotFoundException('Goal not found');
    return goal;
  }

  async update(userId: string, id: string, dto: UpdateGoalDto): Promise<Goal> {
    const goal = await this.findOne(userId, id);
    Object.assign(goal, dto);

    // Update status if target reached
    if (goal.currentAmount >= goal.targetAmount) {
      goal.status = GoalStatus.COMPLETED;
      goal.completedDate = new Date();
    }

    return await this.goalRepository.save(goal);
  }

  /**
   * Contribute to goal - Deduct from account, add to goal
   */
  async contribute(userId: string, id: string, dto: ContributeGoalDto): Promise<Goal> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Step 1: Validate goal
      const goal = await this.findOne(userId, id);
      if (goal.status === GoalStatus.CANCELLED) {
        throw new BadRequestException('Cannot contribute to cancelled goal');
      }

      // Step 2: Validate account and balance
      const account = await this.accountRepository.findOne({
        where: { id: dto.accountId, userId },
      });
      if (!account) {
        throw new NotFoundException('Account not found');
      }
      if (account.balance < dto.amount) {
        throw new BadRequestException('Insufficient account balance');
      }

      // Step 3: Update account balance (decrease)
      account.balance = Number(account.balance) - Number(dto.amount);
      await queryRunner.manager.save(account);

      // Step 4: Update goal current amount (increase)
      goal.currentAmount = Number(goal.currentAmount) + Number(dto.amount);

      // Check if goal completed
      if (goal.currentAmount >= goal.targetAmount) {
        goal.status = GoalStatus.COMPLETED;
        goal.completedDate = new Date();
      }

      await queryRunner.manager.save(goal);

      // Step 5: Find or get savings category
      // First try: Find user's personal savings category
      let savingsCategory = await this.categoryRepository.findOne({
        where: [
          { userId, type: CategoryType.EXPENSE, name: 'Gửi tiết kiệm' },
          { userId, type: CategoryType.EXPENSE, name: 'Savings' },
          { userId, type: CategoryType.EXPENSE, name: 'Tiết kiệm' },
        ],
      });

      // Second try: Use user's default expense category
      if (!savingsCategory) {
        savingsCategory = await this.categoryRepository.findOne({
          where: { userId, type: CategoryType.EXPENSE, isDefault: true },
        });
      }

      // Third try: Use any user's expense category
      if (!savingsCategory) {
        savingsCategory = await this.categoryRepository.findOne({
          where: { userId, type: CategoryType.EXPENSE },
        });
      }

      // Step 6: Create transaction (EXPENSE - money out of account)
      const transaction = this.transactionRepository.create({
        userId,
        accountId: dto.accountId,
        categoryId: savingsCategory?.id, // Assign savings category if found
        goalId: id,
        type: TransactionType.EXPENSE,
        amount: dto.amount,
        date: new Date(),
        description: `Đóng góp vào mục tiêu: ${goal.name}`,
        note: dto.note || `Contribution to goal: ${goal.name}`,
      });
      const savedTransaction = await queryRunner.manager.save(transaction);

      // Step 7: Create goal_transaction history
      const goalTransaction = this.goalTransactionRepository.create({
        goalId: id,
        accountId: dto.accountId,
        transactionId: savedTransaction.id,
        amount: dto.amount,
        type: 'CONTRIBUTION',
        note: dto.note,
      });
      await queryRunner.manager.save(goalTransaction);

      await queryRunner.commitTransaction();
      return goal;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Withdraw from goal - Add to account, deduct from goal
   */
  async withdraw(userId: string, id: string, dto: WithdrawGoalDto): Promise<Goal> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Step 1: Validate goal
      const goal = await this.findOne(userId, id);
      if (dto.amount > goal.currentAmount) {
        throw new BadRequestException('Withdrawal amount exceeds goal current amount');
      }

      // Step 2: Validate account
      const account = await this.accountRepository.findOne({
        where: { id: dto.accountId, userId },
      });
      if (!account) {
        throw new NotFoundException('Account not found');
      }

      // Step 3: Update goal current amount (decrease)
      goal.currentAmount = Number(goal.currentAmount) - Number(dto.amount);

      // Revert status if was completed
      if (goal.status === GoalStatus.COMPLETED && goal.currentAmount < goal.targetAmount) {
        goal.status = GoalStatus.ACTIVE;
        goal.completedDate = null;
      }

      await queryRunner.manager.save(goal);

      // Step 4: Update account balance (increase)
      account.balance = Number(account.balance) + Number(dto.amount);
      await queryRunner.manager.save(account);

      // Step 5: Find savings/income category for withdrawal transaction
      // First try: Find user's specific withdrawal category
      let savingsCategory = await this.categoryRepository.findOne({
        where: [
          { userId, type: CategoryType.INCOME, name: 'Rút tiết kiệm' },
          { userId, type: CategoryType.INCOME, name: 'Savings Withdrawal' },
          { userId, type: CategoryType.INCOME, name: 'Thu nhập khác' },
        ],
      });

      // Second try: Use user's default income category
      if (!savingsCategory) {
        savingsCategory = await this.categoryRepository.findOne({
          where: { userId, type: CategoryType.INCOME, isDefault: true },
        });
      }

      // Third try: Use any user's income category
      if (!savingsCategory) {
        savingsCategory = await this.categoryRepository.findOne({
          where: { userId, type: CategoryType.INCOME },
        });
      }

      // Step 6: Create transaction (INCOME - money into account)
      const transaction = this.transactionRepository.create({
        userId,
        accountId: dto.accountId,
        categoryId: savingsCategory?.id,
        goalId: id,
        type: TransactionType.INCOME,
        amount: dto.amount,
        date: new Date(),
        description: `Rút từ mục tiêu: ${goal.name}`,
        note: dto.reason || `Withdrawal from goal: ${goal.name}`,
      });
      const savedTransaction = await queryRunner.manager.save(transaction);

      // Step 7: Create goal_transaction history
      const goalTransaction = this.goalTransactionRepository.create({
        goalId: id,
        accountId: dto.accountId,
        transactionId: savedTransaction.id,
        amount: dto.amount,
        type: 'WITHDRAWAL',
        note: dto.reason,
      });
      await queryRunner.manager.save(goalTransaction);

      await queryRunner.commitTransaction();
      return goal;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Delete goal and refund money to accounts
   */
  async remove(userId: string, id: string, dto?: DeleteGoalDto): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Step 1: Verify goal ownership
      const goal = await this.findOne(userId, id);
      console.log('🔵 Deleting goal:', { name: goal.name, currentAmount: goal.currentAmount });

      // Step 2: Find all transactions linked to this goal (using goalId field)
      const goalTransactions = await this.transactionRepository.find({
        where: {
          userId,
          goalId: id,
          deletedAt: IsNull(),
        },
        relations: ['account'],
      });

      console.log(`🔵 Found ${goalTransactions.length} transactions linked to goal`);

      // Step 3: Process refunds for each transaction
      for (const transaction of goalTransactions) {
        const account = await queryRunner.manager.findOne(Account, {
          where: { id: transaction.accountId, userId, deletedAt: IsNull() },
        });

        if (!account) {
          console.log(`⚠️ Account not found for transaction ${transaction.id}, skipping...`);
          continue;
        }

        const oldBalance = Number(account.balance);
        console.log(
          `🔵 Processing transaction: ${transaction.type === TransactionType.EXPENSE ? 'CONTRIBUTION' : 'WITHDRAWAL'} of ${transaction.amount} from ${account.name}`,
        );

        // Refund logic:
        // - If EXPENSE (contribution): refund money back to account
        // - If INCOME (withdrawal): reverse the withdrawal (deduct from account)
        if (transaction.type === TransactionType.EXPENSE) {
          // Contribution - return money to account
          account.balance = oldBalance + Number(transaction.amount);
          console.log(`✅ REFUND: ${account.name} ${oldBalance} + ${transaction.amount} = ${account.balance}`);
        } else if (transaction.type === TransactionType.INCOME) {
          // Withdrawal - reverse the withdrawal
          account.balance = oldBalance - Number(transaction.amount);
          console.log(`✅ REVERSE: ${account.name} ${oldBalance} - ${transaction.amount} = ${account.balance}`);
        }

        // Save updated account balance
        await queryRunner.manager.save(account);

        // Soft delete transaction
        await queryRunner.manager.softDelete(Transaction, transaction.id);
        console.log(`🗑️ Deleted transaction ${transaction.id}`);
      }

      // Step 4: Hard delete all goal_transactions records (no soft delete support)
      const deleteResult = await queryRunner.manager.delete(GoalTransaction, { goalId: id });
      console.log(`🗑️ Deleted ${deleteResult.affected || 0} goal_transactions records`);

      // Step 5: Soft delete the goal
      await queryRunner.manager.softDelete(Goal, { id, userId });
      console.log('🟢 Goal deleted successfully!');

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('🔴 DELETE Error:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Get goal transaction history
   */
  async getGoalTransactions(userId: string, goalId: string): Promise<GoalTransaction[]> {
    // Verify goal ownership
    await this.findOne(userId, goalId);

    return await this.goalTransactionRepository.find({
      where: { goalId },
      relations: ['account', 'transaction'],
      order: { createdAt: 'DESC' },
    });
  }
}
