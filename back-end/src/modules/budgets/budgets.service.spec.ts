import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionType } from '../../common/constants/enums';
import { Budget } from '../../entities/budget.entity';
import { Transaction } from '../../entities/transaction.entity';
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto, UpdateBudgetDto } from './dto';

describe('BudgetsService', () => {
  let service: BudgetsService;
  let budgetRepository: Repository<Budget>;
  let transactionRepository: Repository<Transaction>;

  const mockUserId = 'user-123';
  const mockBudgetId = 'budget-456';
  const mockCategoryId = 'category-001';

  const mockBudget: Partial<Budget> = {
    id: mockBudgetId,
    userId: mockUserId,
    categoryId: mockCategoryId,
    name: 'Monthly Food Budget',
    amount: 5000000,
    period: 3, // Monthly
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-31'),
    alertThreshold: 80,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockBudgetRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    softDelete: jest.fn(),
  };

  const mockTransactionRepository = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BudgetsService,
        {
          provide: getRepositoryToken(Budget),
          useValue: mockBudgetRepository,
        },
        {
          provide: getRepositoryToken(Transaction),
          useValue: mockTransactionRepository,
        },
      ],
    }).compile();

    service = module.get<BudgetsService>(BudgetsService);
    budgetRepository = module.get<Repository<Budget>>(getRepositoryToken(Budget));
    transactionRepository = module.get<Repository<Transaction>>(getRepositoryToken(Transaction));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateBudgetDto = {
      name: 'Monthly Food Budget',
      categoryId: mockCategoryId,
      amount: 5000000,
      period: 3,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-31'),
      alertThreshold: 80,
    };

    it('should create a new budget successfully', async () => {
      mockBudgetRepository.create.mockReturnValue(mockBudget);
      mockBudgetRepository.save.mockResolvedValue(mockBudget);

      const result = await service.create(mockUserId, createDto);

      expect(mockBudgetRepository.create).toHaveBeenCalledWith({
        ...createDto,
        userId: mockUserId,
      });
      expect(mockBudgetRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockBudget);
    });
  });

  describe('findAll', () => {
    it('should return all budgets with spent calculation', async () => {
      const mockBudgets = [mockBudget];
      const mockTransactions = [
        { amount: 1000000, type: TransactionType.EXPENSE },
        { amount: 500000, type: TransactionType.EXPENSE },
      ];

      mockBudgetRepository.find.mockResolvedValue(mockBudgets);
      mockTransactionRepository.find.mockResolvedValue(mockTransactions);

      const result = await service.findAll(mockUserId);

      expect(mockBudgetRepository.find).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        relations: ['category'],
        order: { createdAt: 'DESC' },
      });
      expect(result).toHaveLength(1);
      expect(result[0].spent).toBe(1500000);
      expect(result[0].remaining).toBe(3500000);
      expect(result[0].percentage).toBe(30);
    });

    it('should return empty array when user has no budgets', async () => {
      mockBudgetRepository.find.mockResolvedValue([]);

      const result = await service.findAll(mockUserId);

      expect(result).toEqual([]);
    });

    it('should calculate spent as 0 when no transactions exist', async () => {
      const mockBudgets = [mockBudget];
      mockBudgetRepository.find.mockResolvedValue(mockBudgets);
      mockTransactionRepository.find.mockResolvedValue([]);

      const result = await service.findAll(mockUserId);

      expect(result[0].spent).toBe(0);
      expect(result[0].remaining).toBe(5000000);
      expect(result[0].percentage).toBe(0);
    });
  });

  describe('findOne', () => {
    it('should return a budget with spent calculation', async () => {
      const mockTransactions = [{ amount: 2000000, type: TransactionType.EXPENSE }];

      mockBudgetRepository.findOne.mockResolvedValue(mockBudget);
      mockTransactionRepository.find.mockResolvedValue(mockTransactions);

      const result = await service.findOne(mockUserId, mockBudgetId);

      expect(mockBudgetRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockBudgetId, userId: mockUserId },
        relations: ['category'],
      });
      expect(result.spent).toBe(2000000);
      expect(result.remaining).toBe(3000000);
      expect(result.percentage).toBe(40);
    });

    it('should throw NotFoundException when budget does not exist', async () => {
      mockBudgetRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(mockUserId, 'non-existent-id')).rejects.toThrow(NotFoundException);
      await expect(service.findOne(mockUserId, 'non-existent-id')).rejects.toThrow('Budget not found');
    });
  });

  describe('update', () => {
    const updateDto: UpdateBudgetDto = {
      amount: 6000000,
      alertThreshold: 90,
    };

    it('should update budget successfully', async () => {
      const updatedBudget = { ...mockBudget, ...updateDto };
      mockBudgetRepository.findOne.mockResolvedValue(mockBudget);
      mockBudgetRepository.save.mockResolvedValue(updatedBudget);

      const result = await service.update(mockUserId, mockBudgetId, updateDto);

      expect(mockBudgetRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockBudgetId, userId: mockUserId },
      });
      expect(mockBudgetRepository.save).toHaveBeenCalled();
      expect(result.amount).toBe(updateDto.amount);
      expect(result.alertThreshold).toBe(updateDto.alertThreshold);
    });

    it('should throw NotFoundException when budget does not exist', async () => {
      mockBudgetRepository.findOne.mockResolvedValue(null);

      await expect(service.update(mockUserId, 'non-existent-id', updateDto)).rejects.toThrow(NotFoundException);
      await expect(service.update(mockUserId, 'non-existent-id', updateDto)).rejects.toThrow('Budget not found');
    });
  });

  describe('remove', () => {
    it('should soft delete budget successfully', async () => {
      mockBudgetRepository.findOne.mockResolvedValue(mockBudget);
      mockBudgetRepository.softDelete.mockResolvedValue({ affected: 1 });

      await service.remove(mockUserId, mockBudgetId);

      expect(mockBudgetRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockBudgetId, userId: mockUserId },
      });
      expect(mockBudgetRepository.softDelete).toHaveBeenCalledWith(mockBudgetId);
    });

    it('should throw NotFoundException when budget does not exist', async () => {
      mockBudgetRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(mockUserId, 'non-existent-id')).rejects.toThrow(NotFoundException);
      expect(mockBudgetRepository.softDelete).not.toHaveBeenCalled();
    });
  });

  describe('calculateSpent (private method tested via findOne)', () => {
    it('should calculate spent amount correctly for budget with category', async () => {
      const mockTransactions = [
        { amount: 1000000, type: TransactionType.EXPENSE, categoryId: mockCategoryId },
        { amount: 500000, type: TransactionType.EXPENSE, categoryId: mockCategoryId },
      ];

      mockBudgetRepository.findOne.mockResolvedValue(mockBudget);
      mockTransactionRepository.find.mockResolvedValue(mockTransactions);

      const result = await service.findOne(mockUserId, mockBudgetId);

      expect(result.spent).toBe(1500000);
    });

    it('should calculate spent for budget without specific category', async () => {
      const budgetWithoutCategory = { ...mockBudget, categoryId: null };
      const mockTransactions = [
        { amount: 2000000, type: TransactionType.EXPENSE },
        { amount: 1000000, type: TransactionType.EXPENSE },
      ];

      mockBudgetRepository.findOne.mockResolvedValue(budgetWithoutCategory);
      mockTransactionRepository.find.mockResolvedValue(mockTransactions);

      const result = await service.findOne(mockUserId, mockBudgetId);

      expect(result.spent).toBe(3000000);
    });

    it('should only include expense transactions in calculation', async () => {
      const mockTransactions = [
        { amount: 1000000, type: TransactionType.EXPENSE },
        { amount: 5000000, type: TransactionType.INCOME }, // Should be excluded
      ];

      mockBudgetRepository.findOne.mockResolvedValue(mockBudget);
      mockTransactionRepository.find.mockResolvedValue([mockTransactions[0]]);

      const result = await service.findOne(mockUserId, mockBudgetId);

      expect(result.spent).toBe(1000000);
    });
  });

  describe('budget period calculations', () => {
    it('should handle budget without endDate using period calculation', async () => {
      const budgetWithoutEndDate = { ...mockBudget, endDate: null };
      mockBudgetRepository.findOne.mockResolvedValue(budgetWithoutEndDate);
      mockTransactionRepository.find.mockResolvedValue([]);

      const result = await service.findOne(mockUserId, mockBudgetId);

      expect(result).toBeDefined();
      expect(result.spent).toBe(0);
    });

    it('should calculate percentage correctly when spent exceeds budget', async () => {
      const mockTransactions = [
        { amount: 6000000, type: TransactionType.EXPENSE }, // Over budget
      ];

      const budgetData = { ...mockBudget, amount: 5000000 };
      mockBudgetRepository.findOne.mockResolvedValue(budgetData);
      mockTransactionRepository.find.mockResolvedValue(mockTransactions);

      const result = await service.findOne(mockUserId, mockBudgetId);

      expect(result.spent).toBe(6000000);
      expect(result.remaining).toBe(-1000000);
      expect(result.percentage).toBe(120);
    });
  });
});
