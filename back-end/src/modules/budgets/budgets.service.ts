import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { TransactionType } from '../../common/constants/enums';
import { Budget } from '../../entities/budget.entity';
import { Transaction } from '../../entities/transaction.entity';
import { CreateBudgetDto, UpdateBudgetDto } from './dto';

@Injectable()
export class BudgetsService {
  constructor(
    @InjectRepository(Budget)
    private readonly budgetRepository: Repository<Budget>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  async create(userId: string, dto: CreateBudgetDto): Promise<Budget> {
    const budget = this.budgetRepository.create({ ...dto, userId });
    return await this.budgetRepository.save(budget);
  }

  async findAll(userId: string): Promise<any[]> {
    const budgets = await this.budgetRepository.find({
      where: { userId },
      relations: ['category'],
      order: { createdAt: 'DESC' },
    });

    // Calculate spent amount for each budget
    return await Promise.all(
      budgets.map(async (budget) => {
        const spent = await this.calculateSpent(budget);
        return {
          ...budget,
          spent,
          remaining: Number(budget.amount) - spent,
          percentage: (spent / Number(budget.amount)) * 100,
        };
      }),
    );
  }

  async findOne(userId: string, id: string): Promise<any> {
    const budget = await this.budgetRepository.findOne({
      where: { id, userId },
      relations: ['category'],
    });

    if (!budget) {
      throw new NotFoundException('Budget not found');
    }

    const spent = await this.calculateSpent(budget);
    return {
      ...budget,
      spent,
      remaining: Number(budget.amount) - spent,
      percentage: (spent / Number(budget.amount)) * 100,
    };
  }

  async update(userId: string, id: string, dto: UpdateBudgetDto): Promise<Budget> {
    const budget = await this.budgetRepository.findOne({ where: { id, userId } });
    if (!budget) throw new NotFoundException('Budget not found');
    Object.assign(budget, dto);
    return await this.budgetRepository.save(budget);
  }

  async remove(userId: string, id: string): Promise<void> {
    const budget = await this.budgetRepository.findOne({ where: { id, userId } });
    if (!budget) throw new NotFoundException('Budget not found');
    await this.budgetRepository.softDelete(id);
  }

  private async calculateSpent(budget: Budget): Promise<number> {
    const startDate = budget.startDate;
    const endDate = budget.endDate || this.calculateEndDate(budget.startDate, budget.period);

    const where: any = {
      userId: budget.userId,
      type: TransactionType.EXPENSE,
      date: Between(startDate, endDate),
    };

    if (budget.categoryId) {
      where.categoryId = budget.categoryId;
    }

    const transactions = await this.transactionRepository.find({ where });
    return transactions.reduce((sum, t) => sum + Number(t.amount), 0);
  }

  private calculateEndDate(startDate: Date, period: number): Date {
    const date = new Date(startDate);
    switch (period) {
      case 1:
        date.setDate(date.getDate() + 1);
        break; // Daily
      case 2:
        date.setDate(date.getDate() + 7);
        break; // Weekly
      case 3:
        date.setMonth(date.getMonth() + 1);
        break; // Monthly
      case 4:
        date.setMonth(date.getMonth() + 3);
        break; // Quarterly
      case 5:
        date.setFullYear(date.getFullYear() + 1);
        break; // Yearly
      default:
        date.setMonth(date.getMonth() + 1);
        break;
    }
    return date;
  }
}
