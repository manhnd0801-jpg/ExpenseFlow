import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionType } from '../../common/constants/enums';
import { Account } from '../../entities/account.entity';
import { Transaction } from '../../entities/transaction.entity';
import { CreateTransactionDto, QueryTransactionDto } from './dto';
import { TransactionsService } from './transactions.service';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let transactionRepository: Repository<Transaction>;
  let accountRepository: Repository<Account>;

  const mockUserId = 'user-123';
  const mockAccountId = 'account-456';
  const mockToAccountId = 'account-789';
  const mockCategoryId = 'category-001';
  const mockTransactionId = 'transaction-111';

  const mockAccount: Partial<Account> = {
    id: mockAccountId,
    userId: mockUserId,
    name: 'Cash Wallet',
    balance: 5000000,
    currency: 1,
    type: 1,
  };

  const mockToAccount: Partial<Account> = {
    id: mockToAccountId,
    userId: mockUserId,
    name: 'Bank Account',
    balance: 10000000,
    currency: 1,
    type: 2,
  };

  const mockTransaction: Partial<Transaction> = {
    id: mockTransactionId,
    userId: mockUserId,
    accountId: mockAccountId,
    categoryId: mockCategoryId,
    type: TransactionType.EXPENSE,
    amount: 100000,
    date: new Date(),
    description: 'Lunch',
  };

  const mockTransactionRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    softDelete: jest.fn(),
    createQueryBuilder: jest.fn(),
    manager: {
      transaction: jest.fn(),
    },
  };

  const mockAccountRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: getRepositoryToken(Transaction),
          useValue: mockTransactionRepository,
        },
        {
          provide: getRepositoryToken(Account),
          useValue: mockAccountRepository,
        },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
    transactionRepository = module.get<Repository<Transaction>>(getRepositoryToken(Transaction));
    accountRepository = module.get<Repository<Account>>(getRepositoryToken(Account));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createExpenseDto: CreateTransactionDto = {
      accountId: mockAccountId,
      categoryId: mockCategoryId,
      type: TransactionType.EXPENSE,
      amount: 100000,
      date: new Date(),
      description: 'Lunch',
    };

    it('should create an expense transaction successfully', async () => {
      mockAccountRepository.findOne.mockResolvedValue(mockAccount);

      const mockTransactionalEntityManager = {
        save: jest.fn().mockResolvedValue(mockTransaction),
        findOne: jest.fn().mockResolvedValue(mockAccount),
      };

      mockTransactionRepository.create.mockReturnValue(mockTransaction);
      mockTransactionRepository.manager.transaction.mockImplementation(async (cb) =>
        cb(mockTransactionalEntityManager),
      );

      const result = await service.create(mockUserId, createExpenseDto);

      expect(mockAccountRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockAccountId, userId: mockUserId },
      });
      expect(mockTransactionRepository.create).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should create an income transaction successfully', async () => {
      const createIncomeDto: CreateTransactionDto = {
        ...createExpenseDto,
        type: TransactionType.INCOME,
      };
      mockAccountRepository.findOne.mockResolvedValue(mockAccount);

      const mockTransactionalEntityManager = {
        save: jest.fn().mockResolvedValue({ ...mockTransaction, type: TransactionType.INCOME }),
        findOne: jest.fn().mockResolvedValue(mockAccount),
      };

      mockTransactionRepository.create.mockReturnValue({ ...mockTransaction, type: TransactionType.INCOME });
      mockTransactionRepository.manager.transaction.mockImplementation(async (cb) =>
        cb(mockTransactionalEntityManager),
      );

      const result = await service.create(mockUserId, createIncomeDto);

      expect(result).toBeDefined();
    });

    it('should throw BadRequestException when account does not exist', async () => {
      mockAccountRepository.findOne.mockResolvedValue(null);

      await expect(service.create(mockUserId, createExpenseDto)).rejects.toThrow(NotFoundException);
      await expect(service.create(mockUserId, createExpenseDto)).rejects.toThrow('Account not found');
    });

    it('should throw BadRequestException when categoryId is missing for non-transfer', async () => {
      const dtoWithoutCategory = { ...createExpenseDto };
      delete dtoWithoutCategory.categoryId;

      mockAccountRepository.findOne.mockResolvedValue(mockAccount);

      await expect(service.create(mockUserId, dtoWithoutCategory)).rejects.toThrow(BadRequestException);
      await expect(service.create(mockUserId, dtoWithoutCategory)).rejects.toThrow(
        'categoryId is required for income and expense transactions',
      );
    });

    it('should throw BadRequestException when insufficient balance for expense', async () => {
      const accountWithLowBalance = { ...mockAccount, balance: 50000 };
      mockAccountRepository.findOne.mockResolvedValue(accountWithLowBalance);

      await expect(service.create(mockUserId, createExpenseDto)).rejects.toThrow(BadRequestException);
      await expect(service.create(mockUserId, createExpenseDto)).rejects.toThrow('Insufficient account balance');
    });

    it('should create a transfer transaction successfully', async () => {
      const createTransferDto: CreateTransactionDto = {
        accountId: mockAccountId,
        toAccountId: mockToAccountId,
        type: TransactionType.TRANSFER,
        amount: 1000000,
        date: new Date(),
        description: 'Transfer',
      };

      mockAccountRepository.findOne.mockResolvedValueOnce(mockAccount).mockResolvedValueOnce(mockToAccount);

      const mockTransactionalEntityManager = {
        save: jest.fn().mockResolvedValue({ ...mockTransaction, type: TransactionType.TRANSFER }),
        findOne: jest.fn().mockResolvedValueOnce(mockAccount).mockResolvedValueOnce(mockToAccount),
      };

      mockTransactionRepository.create.mockReturnValue({ ...mockTransaction, type: TransactionType.TRANSFER });
      mockTransactionRepository.manager.transaction.mockImplementation(async (cb) =>
        cb(mockTransactionalEntityManager),
      );

      const result = await service.create(mockUserId, createTransferDto);

      expect(mockAccountRepository.findOne).toHaveBeenCalledTimes(2);
      expect(result).toBeDefined();
    });

    it('should throw BadRequestException when toAccountId missing for transfer', async () => {
      const createTransferDto: CreateTransactionDto = {
        accountId: mockAccountId,
        type: TransactionType.TRANSFER,
        amount: 1000000,
        date: new Date(),
        description: 'Transfer',
      };

      mockAccountRepository.findOne.mockResolvedValue(mockAccount);

      await expect(service.create(mockUserId, createTransferDto)).rejects.toThrow(BadRequestException);
      await expect(service.create(mockUserId, createTransferDto)).rejects.toThrow(
        'toAccountId is required for transfer transactions',
      );
    });
  });

  describe('findAll', () => {
    const queryDto: QueryTransactionDto = {
      page: 1,
      limit: 20,
    };

    it('should return paginated transactions', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockTransaction], 1]),
      };

      mockTransactionRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findAll(mockUserId, queryDto);

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(mockTransactionRepository.createQueryBuilder).toHaveBeenCalledWith('transaction');
    });

    it('should filter transactions by type', async () => {
      const queryWithType: QueryTransactionDto = {
        ...queryDto,
        type: TransactionType.EXPENSE,
      };

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockTransaction], 1]),
      };

      mockTransactionRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findAll(mockUserId, queryWithType);

      expect(result.data).toBeDefined();
    });

    it('should apply search filter', async () => {
      const queryWithSearch: QueryTransactionDto = {
        ...queryDto,
        search: 'Lunch',
      };

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockTransaction], 1]),
      };

      mockTransactionRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await service.findAll(mockUserId, queryWithSearch);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a transaction when it exists', async () => {
      mockTransactionRepository.findOne.mockResolvedValue(mockTransaction);

      const result = await service.findOne(mockUserId, mockTransactionId);

      expect(mockTransactionRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockTransactionId, userId: mockUserId },
        relations: ['account', 'category', 'toAccount', 'event', 'user'],
      });
      expect(result).toEqual(mockTransaction);
    });

    it('should throw NotFoundException when transaction does not exist', async () => {
      mockTransactionRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(mockUserId, 'non-existent-id')).rejects.toThrow(NotFoundException);
      await expect(service.findOne(mockUserId, 'non-existent-id')).rejects.toThrow('Transaction not found');
    });
  });

  describe('getSummary', () => {
    it('should calculate transaction summary correctly', async () => {
      const mockTransactions = [
        { ...mockTransaction, type: TransactionType.INCOME, amount: 5000000 },
        { ...mockTransaction, type: TransactionType.EXPENSE, amount: 2000000, category: { name: 'Food' } },
        { ...mockTransaction, type: TransactionType.EXPENSE, amount: 1000000, category: { name: 'Transport' } },
      ];

      mockTransactionRepository.find.mockResolvedValue(mockTransactions);

      const result = await service.getSummary(mockUserId);

      expect(result.totalIncome).toBe(5000000);
      expect(result.totalExpense).toBe(3000000);
      expect(result.balance).toBe(2000000);
      expect(result.transactionCount).toBe(3);
      expect(result.expenseByCategory).toBeDefined();
    });

    it('should return zero values when no transactions exist', async () => {
      mockTransactionRepository.find.mockResolvedValue([]);

      const result = await service.getSummary(mockUserId);

      expect(result.totalIncome).toBe(0);
      expect(result.totalExpense).toBe(0);
      expect(result.balance).toBe(0);
      expect(result.transactionCount).toBe(0);
    });
  });
});
