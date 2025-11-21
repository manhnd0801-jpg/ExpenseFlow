import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from '../../entities/account.entity';
import { Category } from '../../entities/category.entity';
import { Transaction } from '../../entities/transaction.entity';
import { DateRangeDto } from './dto';
import { ReportsService } from './reports.service';

describe('ReportsService', () => {
  let service: ReportsService;
  let transactionRepository: Repository<Transaction>;
  let accountRepository: Repository<Account>;
  let categoryRepository: Repository<Category>;

  const mockTransactionRepository = {
    createQueryBuilder: jest.fn(),
  };

  const mockAccountRepository = {
    createQueryBuilder: jest.fn(),
  };

  const mockCategoryRepository = {};

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    addGroupBy: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
    getRawMany: jest.fn(),
    getOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        {
          provide: getRepositoryToken(Transaction),
          useValue: mockTransactionRepository,
        },
        {
          provide: getRepositoryToken(Account),
          useValue: mockAccountRepository,
        },
        {
          provide: getRepositoryToken(Category),
          useValue: mockCategoryRepository,
        },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
    transactionRepository = module.get<Repository<Transaction>>(getRepositoryToken(Transaction));
    accountRepository = module.get<Repository<Account>>(getRepositoryToken(Account));
    categoryRepository = module.get<Repository<Category>>(getRepositoryToken(Category));

    jest.clearAllMocks();
  });

  describe('getIncomeExpenseReport', () => {
    it('should return income/expense report with correct calculations', async () => {
      const userId = 'user-id-1';
      const dateRange: DateRangeDto = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
      };

      const mockTransactions = [
        { type: 1, amount: 5000000 }, // Income
        { type: 1, amount: 3000000 }, // Income
        { type: 2, amount: 2000000 }, // Expense
        { type: 2, amount: 1000000 }, // Expense
      ];

      mockTransactionRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getMany.mockResolvedValue(mockTransactions);

      const result = await service.getIncomeExpenseReport(userId, dateRange);

      expect(result).toEqual({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        totalIncome: 8000000,
        totalExpense: 3000000,
        balance: 5000000,
        transactionCount: 4,
        incomeTransactionCount: 2,
        expenseTransactionCount: 2,
      });
      expect(mockTransactionRepository.createQueryBuilder).toHaveBeenCalled();
    });

    it('should filter by accountId when provided', async () => {
      const userId = 'user-id-1';
      const dateRange: DateRangeDto = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        accountId: 'account-id-1',
      };

      mockTransactionRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getMany.mockResolvedValue([]);

      await service.getIncomeExpenseReport(userId, dateRange);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('transaction.account_id = :accountId', {
        accountId: 'account-id-1',
      });
    });

    it('should handle zero transactions', async () => {
      const userId = 'user-id-1';
      const dateRange: DateRangeDto = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
      };

      mockTransactionRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getMany.mockResolvedValue([]);

      const result = await service.getIncomeExpenseReport(userId, dateRange);

      expect(result.totalIncome).toBe(0);
      expect(result.totalExpense).toBe(0);
      expect(result.balance).toBe(0);
      expect(result.transactionCount).toBe(0);
    });
  });

  describe('getCategoryDistribution', () => {
    it('should return category distribution with percentages', async () => {
      const userId = 'user-id-1';
      const dateRange: DateRangeDto = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
      };

      const mockRawData = [
        {
          categoryId: 'cat-1',
          categoryName: 'Food',
          categoryColor: '#FF0000',
          categoryIcon: 'food',
          totalAmount: '2000000',
          transactionCount: '5',
        },
        {
          categoryId: 'cat-2',
          categoryName: 'Transport',
          categoryColor: '#00FF00',
          categoryIcon: 'car',
          totalAmount: '1000000',
          transactionCount: '3',
        },
      ];

      mockTransactionRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getRawMany.mockResolvedValue(mockRawData);

      const result = await service.getCategoryDistribution(userId, dateRange);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        categoryId: 'cat-1',
        categoryName: 'Food',
        categoryColor: '#FF0000',
        categoryIcon: 'food',
        totalAmount: 2000000,
        transactionCount: 5,
        percentage: '66.67', // 2M / 3M * 100
      });
      expect(result[1].percentage).toBe('33.33'); // 1M / 3M * 100
    });

    it('should handle zero expense case', async () => {
      const userId = 'user-id-1';
      const dateRange: DateRangeDto = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
      };

      mockTransactionRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getRawMany.mockResolvedValue([]);

      const result = await service.getCategoryDistribution(userId, dateRange);

      expect(result).toEqual([]);
    });
  });

  describe('getMonthlyTrend', () => {
    it('should return monthly trend data for the year', async () => {
      const userId = 'user-id-1';
      const year = 2024;

      const mockTransactions = [
        { type: 1, amount: 5000000, date: new Date('2024-01-15') }, // Jan Income
        { type: 2, amount: 2000000, date: new Date('2024-01-20') }, // Jan Expense
        { type: 1, amount: 3000000, date: new Date('2024-02-10') }, // Feb Income
        { type: 2, amount: 1000000, date: new Date('2024-02-25') }, // Feb Expense
      ];

      mockTransactionRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getMany.mockResolvedValue(mockTransactions);

      const result = await service.getMonthlyTrend(userId, year);

      expect(result.year).toBe(2024);
      expect(result.data).toHaveLength(12);
      expect(result.data[0]).toEqual(
        expect.objectContaining({
          month: 1,
          income: 5000000,
          expense: 2000000,
          balance: 3000000,
          transactionCount: 2,
        }),
      );
      expect(result.data[1]).toEqual(
        expect.objectContaining({
          month: 2,
          income: 3000000,
          expense: 1000000,
          balance: 2000000,
          transactionCount: 2,
        }),
      );
      expect(result.totalIncome).toBe(8000000);
      expect(result.totalExpense).toBe(3000000);
    });

    it('should handle months with no transactions', async () => {
      const userId = 'user-id-1';
      const year = 2024;

      mockTransactionRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getMany.mockResolvedValue([]);

      const result = await service.getMonthlyTrend(userId, year);

      expect(result.data).toHaveLength(12);
      result.data.forEach((monthData) => {
        expect(monthData.income).toBe(0);
        expect(monthData.expense).toBe(0);
        expect(monthData.balance).toBe(0);
        expect(monthData.transactionCount).toBe(0);
      });
    });
  });

  describe('getAccountBalanceHistory', () => {
    it('should return all accounts balance', async () => {
      const userId = 'user-id-1';

      const mockAccounts = [
        {
          id: 'acc-1',
          name: 'Cash',
          type: 1,
          balance: 5000000,
          currency: 1,
          color: '#000000',
          icon: 'wallet',
        },
        {
          id: 'acc-2',
          name: 'Bank',
          type: 2,
          balance: 10000000,
          currency: 1,
          color: '#0000FF',
          icon: 'bank',
        },
      ];

      mockAccountRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getMany.mockResolvedValue(mockAccounts);

      const result = await service.getAccountBalanceHistory(userId);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        accountId: 'acc-1',
        accountName: 'Cash',
        accountType: 1,
        currentBalance: 5000000,
        currency: 1,
        color: '#000000',
        icon: 'wallet',
      });
    });

    it('should filter by accountId when provided', async () => {
      const userId = 'user-id-1';
      const accountId = 'acc-1';

      mockAccountRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getMany.mockResolvedValue([]);

      await service.getAccountBalanceHistory(userId, accountId);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('account.id = :accountId', { accountId });
    });
  });

  describe('getCashFlow', () => {
    it('should return daily cash flow data', async () => {
      const userId = 'user-id-1';
      const dateRange: DateRangeDto = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
      };

      const mockTransactions = [
        { type: 1, amount: 5000000, date: new Date('2024-01-01') },
        { type: 2, amount: 2000000, date: new Date('2024-01-01') },
        { type: 1, amount: 3000000, date: new Date('2024-01-02') },
      ];

      mockTransactionRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getMany.mockResolvedValue(mockTransactions);

      const result = await service.getCashFlow(userId, dateRange);

      expect(mockTransactionRepository.createQueryBuilder).toHaveBeenCalled();
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('transaction.date', 'ASC');
    });
  });
});
