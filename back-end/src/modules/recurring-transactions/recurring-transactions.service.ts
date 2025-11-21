import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FrequencyType } from '../../common/constants/enums';
import { RecurringTransaction } from '../../entities/recurring-transaction.entity';
import { CreateRecurringTransactionDto, QueryRecurringTransactionDto, UpdateRecurringTransactionDto } from './dto';

/**
 * Service for managing recurring transactions
 */
@Injectable()
export class RecurringTransactionsService {
  constructor(
    @InjectRepository(RecurringTransaction)
    private recurringTransactionRepository: Repository<RecurringTransaction>,
  ) {}

  /**
   * Create new recurring transaction
   */
  async create(userId: string, createDto: CreateRecurringTransactionDto): Promise<RecurringTransaction> {
    const startDate = new Date(createDto.startDate);
    const endDate = createDto.endDate ? new Date(createDto.endDate) : null;

    // Validate dates
    if (endDate && endDate <= startDate) {
      throw new BadRequestException('End date must be after start date');
    }

    // Calculate next execution date
    const nextExecutionDate = this.calculateNextExecutionDate(startDate, createDto.frequency);

    const recurringTransaction = this.recurringTransactionRepository.create({
      userId,
      ...createDto,
      startDate,
      endDate,
      nextExecutionDate,
      executionCount: 0,
      isActive: createDto.isActive ?? true,
    });

    return await this.recurringTransactionRepository.save(recurringTransaction);
  }

  /**
   * Find all recurring transactions for a user with pagination
   */
  async findAll(
    userId: string,
    query: QueryRecurringTransactionDto,
  ): Promise<{ items: RecurringTransaction[]; total: number }> {
    const { page = 1, limit = 20, type, isActive } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.recurringTransactionRepository
      .createQueryBuilder('rt')
      .where('rt.userId = :userId', { userId })
      .leftJoinAndSelect('rt.category', 'category');

    // Apply filters
    if (type) {
      queryBuilder.andWhere('rt.type = :type', { type });
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('rt.isActive = :isActive', { isActive });
    }

    // Pagination
    queryBuilder.skip(skip).take(limit).orderBy('rt.nextExecutionDate', 'ASC');

    const [items, total] = await queryBuilder.getManyAndCount();

    return { items, total };
  }

  /**
   * Find one recurring transaction by ID
   */
  async findOne(id: string, userId: string): Promise<RecurringTransaction> {
    const recurringTransaction = await this.recurringTransactionRepository.findOne({
      where: { id, userId },
      relations: ['category'],
    });

    if (!recurringTransaction) {
      throw new NotFoundException('Recurring transaction not found');
    }

    return recurringTransaction;
  }

  /**
   * Update recurring transaction
   */
  async update(id: string, userId: string, updateDto: UpdateRecurringTransactionDto): Promise<RecurringTransaction> {
    const recurringTransaction = await this.findOne(id, userId);

    // If frequency or start date changed, recalculate next execution
    if (updateDto.frequency || updateDto.startDate) {
      const startDate = updateDto.startDate ? new Date(updateDto.startDate) : recurringTransaction.startDate;
      const frequency = updateDto.frequency || recurringTransaction.frequency;

      recurringTransaction.nextExecutionDate = this.calculateNextExecutionDate(startDate, frequency);
    }

    // Validate end date if changed
    if (updateDto.endDate) {
      const endDate = new Date(updateDto.endDate);
      const startDate = updateDto.startDate ? new Date(updateDto.startDate) : recurringTransaction.startDate;

      if (endDate <= startDate) {
        throw new BadRequestException('End date must be after start date');
      }
    }

    Object.assign(recurringTransaction, updateDto);

    return await this.recurringTransactionRepository.save(recurringTransaction);
  }

  /**
   * Delete recurring transaction (soft delete)
   */
  async remove(id: string, userId: string): Promise<void> {
    const recurringTransaction = await this.findOne(id, userId);
    await this.recurringTransactionRepository.softRemove(recurringTransaction);
  }

  /**
   * Toggle active status
   */
  async toggleActive(id: string, userId: string): Promise<RecurringTransaction> {
    const recurringTransaction = await this.findOne(id, userId);
    recurringTransaction.isActive = !recurringTransaction.isActive;
    return await this.recurringTransactionRepository.save(recurringTransaction);
  }

  /**
   * Get due recurring transactions (for cron job)
   * Returns all recurring transactions that should be executed today or earlier
   */
  async getDueTransactions(userId?: string): Promise<RecurringTransaction[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const queryBuilder = this.recurringTransactionRepository
      .createQueryBuilder('rt')
      .where('rt.isActive = :isActive', { isActive: true })
      .andWhere('rt.nextExecutionDate <= :today', { today })
      .leftJoinAndSelect('rt.category', 'category');

    if (userId) {
      queryBuilder.andWhere('rt.userId = :userId', { userId });
    }

    return await queryBuilder.getMany();
  }

  /**
   * Execute recurring transaction (mark as executed and calculate next date)
   * Note: This doesn't create the actual transaction - that's handled by TransactionsService
   */
  async executeRecurringTransaction(id: string): Promise<RecurringTransaction> {
    const recurringTransaction = await this.recurringTransactionRepository.findOne({
      where: { id },
    });

    if (!recurringTransaction) {
      throw new NotFoundException('Recurring transaction not found');
    }

    if (!recurringTransaction.isActive) {
      throw new BadRequestException('Recurring transaction is not active');
    }

    const today = new Date();

    // Update execution info
    recurringTransaction.lastExecutionDate = today;
    recurringTransaction.executionCount += 1;

    // Calculate next execution date
    const nextDate = this.calculateNextExecutionDate(today, recurringTransaction.frequency);

    // Check if next date exceeds end date
    if (recurringTransaction.endDate && nextDate > recurringTransaction.endDate) {
      recurringTransaction.isActive = false;
      recurringTransaction.nextExecutionDate = null;
    } else {
      recurringTransaction.nextExecutionDate = nextDate;
    }

    return await this.recurringTransactionRepository.save(recurringTransaction);
  }

  /**
   * Calculate next execution date based on frequency
   */
  private calculateNextExecutionDate(fromDate: Date, frequency: FrequencyType): Date {
    const nextDate = new Date(fromDate);

    switch (frequency) {
      case FrequencyType.DAILY:
        nextDate.setDate(nextDate.getDate() + 1);
        break;

      case FrequencyType.WEEKLY:
        nextDate.setDate(nextDate.getDate() + 7);
        break;

      case FrequencyType.MONTHLY:
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;

      case FrequencyType.QUARTERLY:
        nextDate.setMonth(nextDate.getMonth() + 3);
        break;

      case FrequencyType.YEARLY:
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;

      default:
        throw new BadRequestException('Invalid frequency type');
    }

    return nextDate;
  }
}
