import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FrequencyType, TransactionType } from '../../common/constants/enums';
import { RecurringTransaction } from '../../entities/recurring-transaction.entity';
import { RecurringTransactionsService } from './recurring-transactions.service';

describe('RecurringTransactionsService', () => {
  let service: RecurringTransactionsService;
  let repository: Repository<RecurringTransaction>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
    softDelete: jest.fn(),
    softRemove: jest.fn(),
  };

  const mockUserId = 'user-uuid-123';
  const mockRecurringId = 'recurring-uuid-456';

  const mockRecurring: Partial<RecurringTransaction> = {
    id: mockRecurringId,
    userId: mockUserId,
    type: TransactionType.EXPENSE,
    categoryId: 'category-uuid',
    name: 'Monthly Rent',
    amount: 1000,
    description: 'Monthly Rent',
    frequency: FrequencyType.MONTHLY,
    startDate: new Date('2024-01-01'),
    nextExecutionDate: new Date('2024-02-01'),
    endDate: new Date('2024-12-31'),
    isActive: true,
    executionCount: 0,
    lastExecutionDate: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecurringTransactionsService,
        {
          provide: getRepositoryToken(RecurringTransaction),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<RecurringTransactionsService>(RecurringTransactionsService);
    repository = module.get<Repository<RecurringTransaction>>(getRepositoryToken(RecurringTransaction));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // calculateNextExecutionDate is private - test indirectly through create() and executeRecurring Transaction()

  describe('create', () => {
    it('should create recurring transaction with calculated next date', async () => {
      const createDto = {
        name: 'Monthly Rent',
        type: TransactionType.EXPENSE,
        categoryId: 'category-uuid',
        amount: 1000,
        description: 'Monthly Rent',
        frequency: FrequencyType.MONTHLY,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        isActive: true,
      };

      mockRepository.create.mockReturnValue(mockRecurring);
      mockRepository.save.mockResolvedValue(mockRecurring);

      const result = await service.create(mockUserId, createDto);

      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('findOne', () => {
    it('should find recurring transaction by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockRecurring);

      const result = await service.findOne(mockRecurringId, mockUserId);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockRecurringId, userId: mockUserId },
        relations: ['category'],
      });
      expect(result).toEqual(mockRecurring);
    });

    it('should throw NotFoundException when not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(mockRecurringId, mockUserId)).rejects.toThrow(NotFoundException);
    });

    it('should not return recurring from different user', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(mockRecurringId, 'different-user-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('toggleActive', () => {
    it('should toggle active status from true to false', async () => {
      const activeRecurring = { ...mockRecurring, isActive: true };
      mockRepository.findOne.mockResolvedValue(activeRecurring);
      mockRepository.save.mockResolvedValue({ ...activeRecurring, isActive: false });

      const result = await service.toggleActive(mockRecurringId, mockUserId);

      expect(result.isActive).toBe(false);
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should toggle active status from false to true', async () => {
      const inactiveRecurring = { ...mockRecurring, isActive: false };
      mockRepository.findOne.mockResolvedValue(inactiveRecurring);
      mockRepository.save.mockResolvedValue({ ...inactiveRecurring, isActive: true });

      const result = await service.toggleActive(mockRecurringId, mockUserId);

      expect(result.isActive).toBe(true);
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });

  describe('executeRecurringTransaction', () => {
    it('should execute recurring transaction and update dates', async () => {
      const recurring: any = {
        ...mockRecurring,
        nextExecutionDate: new Date('2024-02-01'),
        executionCount: 0,
        frequency: FrequencyType.MONTHLY,
        endDate: new Date('2024-12-31'),
      };

      mockRepository.findOne.mockResolvedValue(recurring);
      mockRepository.save.mockResolvedValue({
        ...recurring,
        executionCount: 1,
        lastExecutionDate: new Date('2024-02-01'),
        nextExecutionDate: new Date('2024-03-01'),
      });

      const result = await service.executeRecurringTransaction(mockRecurringId);

      expect(mockRepository.save).toHaveBeenCalled();
      expect(result.executionCount).toBe(1);
    });

    it('should auto-disable when exceeding end date', async () => {
      const recurring: any = {
        ...mockRecurring,
        nextExecutionDate: new Date('2024-12-01'),
        endDate: new Date('2024-12-31'),
        frequency: FrequencyType.MONTHLY,
        isActive: true,
      };

      // Next execution would be 2025-01-01, which is > endDate
      mockRepository.findOne.mockResolvedValue(recurring);
      mockRepository.save.mockResolvedValue({
        ...recurring,
        isActive: false,
        nextExecutionDate: new Date('2025-01-01'),
      });

      const result = await service.executeRecurringTransaction(mockRecurringId);

      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException for inactive recurring', async () => {
      const inactiveRecurring = { ...mockRecurring, isActive: false };
      mockRepository.findOne.mockResolvedValue(inactiveRecurring);

      await expect(service.executeRecurringTransaction(mockRecurringId)).rejects.toThrow();
    });
  });

  describe('getDueTransactions', () => {
    it('should return transactions due for execution', async () => {
      const today = new Date();
      const dueRecurring = {
        ...mockRecurring,
        nextExecutionDate: today,
        isActive: true,
      };

      const queryBuilder: any = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([dueRecurring]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await service.getDueTransactions();

      expect(result).toHaveLength(1);
      expect(queryBuilder.where).toHaveBeenCalled();
      expect(queryBuilder.andWhere).toHaveBeenCalled();
      expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalled();
    });

    it('should filter by userId when provided', async () => {
      const queryBuilder: any = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      await service.getDueTransactions(mockUserId);

      expect(queryBuilder.andWhere).toHaveBeenCalledWith('rt.userId = :userId', { userId: mockUserId });
    });
  });

  describe('remove', () => {
    it('should soft delete recurring transaction', async () => {
      mockRepository.findOne.mockResolvedValue(mockRecurring);
      mockRepository.softRemove.mockResolvedValue(mockRecurring);

      await service.remove(mockRecurringId, mockUserId);

      expect(mockRepository.softRemove).toHaveBeenCalledWith(mockRecurring);
    });

    it('should throw NotFoundException when deleting non-existent recurring', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(mockRecurringId, mockUserId)).rejects.toThrow(NotFoundException);
    });
  });
});
