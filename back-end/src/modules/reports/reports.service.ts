import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from '../../entities/account.entity';
import { Category } from '../../entities/category.entity';
import { Transaction } from '../../entities/transaction.entity';
import { DateRangeDto } from './dto';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  /**
   * Income vs Expense Report
   * Tổng thu, tổng chi, số dư trong khoảng thời gian
   */
  async getIncomeExpenseReport(userId: string, dateRange: DateRangeDto) {
    const { startDate, endDate, accountId } = dateRange;

    const queryBuilder = this.transactionRepository
      .createQueryBuilder('transaction')
      .where('transaction.user_id = :userId', { userId })
      .andWhere('transaction.deleted_at IS NULL')
      .andWhere('transaction.date >= :startDate', { startDate })
      .andWhere('transaction.date <= :endDate', { endDate });

    if (accountId) {
      queryBuilder.andWhere('transaction.account_id = :accountId', {
        accountId,
      });
    }

    const transactions = await queryBuilder.getMany();

    const income = transactions
      .filter((t) => t.type === 1) // Income
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const expense = transactions
      .filter((t) => t.type === 2) // Expense
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const balance = income - expense;

    return {
      startDate,
      endDate,
      totalIncome: income,
      totalExpense: expense,
      balance,
      transactionCount: transactions.length,
      incomeTransactionCount: transactions.filter((t) => t.type === 1).length,
      expenseTransactionCount: transactions.filter((t) => t.type === 2).length,
    };
  }

  /**
   * Category Distribution Report
   * Phân bổ chi tiêu theo danh mục (Pie chart data)
   */
  async getCategoryDistribution(userId: string, dateRange: DateRangeDto) {
    const { startDate, endDate } = dateRange;

    const result = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('category.id', 'categoryId')
      .addSelect('category.name', 'categoryName')
      .addSelect('category.color', 'categoryColor')
      .addSelect('category.icon', 'categoryIcon')
      .addSelect('SUM(transaction.amount)', 'totalAmount')
      .addSelect('COUNT(transaction.id)', 'transactionCount')
      .innerJoin('transaction.category', 'category')
      .where('transaction.user_id = :userId', { userId })
      .andWhere('transaction.type = :type', { type: 2 }) // Only expenses
      .andWhere('transaction.deleted_at IS NULL')
      .andWhere('transaction.date >= :startDate', { startDate })
      .andWhere('transaction.date <= :endDate', { endDate })
      .groupBy('category.id')
      .addGroupBy('category.name')
      .addGroupBy('category.color')
      .addGroupBy('category.icon')
      .orderBy('SUM(transaction.amount)', 'DESC')
      .getRawMany();

    const totalExpense = result.reduce((sum, item) => sum + Number(item.totalAmount), 0);

    return result.map((item) => ({
      categoryId: item.categoryId,
      categoryName: item.categoryName,
      categoryColor: item.categoryColor,
      categoryIcon: item.categoryIcon,
      totalAmount: Number(item.totalAmount),
      transactionCount: Number(item.transactionCount),
      percentage: totalExpense > 0 ? ((Number(item.totalAmount) / totalExpense) * 100).toFixed(2) : '0.00',
    }));
  }

  /**
   * Monthly Trend Report
   * Xu hướng thu chi theo tháng (Line/Bar chart data)
   */
  async getMonthlyTrend(userId: string, year: number) {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    const transactions = await this.transactionRepository
      .createQueryBuilder('transaction')
      .where('transaction.user_id = :userId', { userId })
      .andWhere('transaction.deleted_at IS NULL')
      .andWhere('transaction.date >= :startDate', { startDate })
      .andWhere('transaction.date <= :endDate', { endDate })
      .orderBy('transaction.date', 'ASC')
      .getMany();

    // Group by month
    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      monthName: new Date(year, i).toLocaleString('default', {
        month: 'short',
      }),
      income: 0,
      expense: 0,
      balance: 0,
      transactionCount: 0,
    }));

    transactions.forEach((transaction) => {
      const month = new Date(transaction.date).getMonth();
      monthlyData[month].transactionCount++;

      if (transaction.type === 1) {
        // Income
        monthlyData[month].income += Number(transaction.amount);
      } else if (transaction.type === 2) {
        // Expense
        monthlyData[month].expense += Number(transaction.amount);
      }
    });

    // Calculate balance for each month
    monthlyData.forEach((data) => {
      data.balance = data.income - data.expense;
    });

    return {
      year,
      data: monthlyData,
      totalIncome: monthlyData.reduce((sum, m) => sum + m.income, 0),
      totalExpense: monthlyData.reduce((sum, m) => sum + m.expense, 0),
    };
  }

  /**
   * Account Balance History
   * Lịch sử số dư của các tài khoản
   */
  async getAccountBalanceHistory(userId: string, accountId?: string) {
    const queryBuilder = this.accountRepository
      .createQueryBuilder('account')
      .where('account.user_id = :userId', { userId })
      .andWhere('account.deleted_at IS NULL');

    if (accountId) {
      queryBuilder.andWhere('account.id = :accountId', { accountId });
    }

    const accounts = await queryBuilder.getMany();

    return accounts.map((account) => ({
      accountId: account.id,
      accountName: account.name,
      accountType: account.type,
      currentBalance: Number(account.balance),
      currency: account.currency,
      color: account.color,
      icon: account.icon,
    }));
  }

  /**
   * Cash Flow Report
   * Dòng tiền vào/ra theo ngày
   */
  async getCashFlow(userId: string, dateRange: DateRangeDto) {
    const { startDate, endDate } = dateRange;

    const transactions = await this.transactionRepository
      .createQueryBuilder('transaction')
      .where('transaction.user_id = :userId', { userId })
      .andWhere('transaction.deleted_at IS NULL')
      .andWhere('transaction.date >= :startDate', { startDate })
      .andWhere('transaction.date <= :endDate', { endDate })
      .orderBy('transaction.date', 'ASC')
      .getMany();

    // Group by date
    const dailyFlow = new Map<string, any>();

    transactions.forEach((transaction) => {
      const dateKey = transaction.date.toISOString().split('T')[0];

      if (!dailyFlow.has(dateKey)) {
        dailyFlow.set(dateKey, {
          date: dateKey,
          income: 0,
          expense: 0,
          netFlow: 0,
          transactionCount: 0,
        });
      }

      const dayData = dailyFlow.get(dateKey);
      dayData.transactionCount++;

      if (transaction.type === 1) {
        // Income
        dayData.income += Number(transaction.amount);
      } else if (transaction.type === 2) {
        // Expense
        dayData.expense += Number(transaction.amount);
      }

      dayData.netFlow = dayData.income - dayData.expense;
    });

    return {
      startDate,
      endDate,
      data: Array.from(dailyFlow.values()),
    };
  }

  /**
   * Top Spending Categories
   * Top danh mục chi tiêu nhiều nhất
   */
  async getTopSpendingCategories(userId: string, dateRange: DateRangeDto, limit: number = 10) {
    const { startDate, endDate } = dateRange;

    const result = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('category.id', 'categoryId')
      .addSelect('category.name', 'categoryName')
      .addSelect('category.icon', 'categoryIcon')
      .addSelect('category.color', 'categoryColor')
      .addSelect('SUM(transaction.amount)', 'totalAmount')
      .addSelect('COUNT(transaction.id)', 'transactionCount')
      .addSelect('AVG(transaction.amount)', 'averageAmount')
      .innerJoin('transaction.category', 'category')
      .where('transaction.user_id = :userId', { userId })
      .andWhere('transaction.type = :type', { type: 2 }) // Expense only
      .andWhere('transaction.deleted_at IS NULL')
      .andWhere('transaction.date >= :startDate', { startDate })
      .andWhere('transaction.date <= :endDate', { endDate })
      .groupBy('category.id')
      .addGroupBy('category.name')
      .addGroupBy('category.icon')
      .addGroupBy('category.color')
      .orderBy('SUM(transaction.amount)', 'DESC')
      .limit(limit)
      .getRawMany();

    return result.map((item) => ({
      categoryId: item.categoryId,
      categoryName: item.categoryName,
      categoryIcon: item.categoryIcon,
      categoryColor: item.categoryColor,
      totalAmount: Number(item.totalAmount),
      transactionCount: Number(item.transactionCount),
      averageAmount: Number(item.averageAmount).toFixed(2),
    }));
  }

  /**
   * Financial Summary
   * Tổng quan tài chính toàn diện
   */
  async getFinancialSummary(userId: string) {
    // Get total balance from all accounts
    const accounts = await this.accountRepository.find({
      where: { userId, deletedAt: null as any },
    });

    const totalBalance = accounts.reduce((sum, acc) => sum + Number(acc.balance), 0);

    // Get this month's data
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const thisMonthReport = await this.getIncomeExpenseReport(userId, {
      startDate: startOfMonth,
      endDate: endOfMonth,
    });

    // Get last month's data for comparison
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const lastMonthReport = await this.getIncomeExpenseReport(userId, {
      startDate: startOfLastMonth,
      endDate: endOfLastMonth,
    });

    return {
      totalBalance,
      accountCount: accounts.length,
      thisMonth: {
        income: thisMonthReport.totalIncome,
        expense: thisMonthReport.totalExpense,
        balance: thisMonthReport.balance,
        transactionCount: thisMonthReport.transactionCount,
      },
      lastMonth: {
        income: lastMonthReport.totalIncome,
        expense: lastMonthReport.totalExpense,
        balance: lastMonthReport.balance,
      },
      comparison: {
        incomeChange: thisMonthReport.totalIncome - lastMonthReport.totalIncome,
        expenseChange: thisMonthReport.totalExpense - lastMonthReport.totalExpense,
        incomeChangePercent:
          lastMonthReport.totalIncome > 0
            ? (
                ((thisMonthReport.totalIncome - lastMonthReport.totalIncome) / lastMonthReport.totalIncome) *
                100
              ).toFixed(2)
            : '0.00',
        expenseChangePercent:
          lastMonthReport.totalExpense > 0
            ? (
                ((thisMonthReport.totalExpense - lastMonthReport.totalExpense) / lastMonthReport.totalExpense) *
                100
              ).toFixed(2)
            : '0.00',
      },
    };
  }
}
