import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from '../../entities/account.entity';
import { AccountsService } from './accounts.service';
import { CreateAccountDto, UpdateAccountDto } from './dto';

describe('AccountsService', () => {
  let service: AccountsService;
  let accountRepository: Repository<Account>;

  const mockUserId = 'user-123';
  const mockAccountId = 'account-456';

  const mockAccount: Partial<Account> = {
    id: mockAccountId,
    userId: mockUserId,
    name: 'Cash Wallet',
    type: 1, // CASH
    balance: 1000000,
    currency: 1, // VND
    includeInTotal: true,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAccountRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountsService,
        {
          provide: getRepositoryToken(Account),
          useValue: mockAccountRepository,
        },
      ],
    }).compile();

    service = module.get<AccountsService>(AccountsService);
    accountRepository = module.get<Repository<Account>>(getRepositoryToken(Account));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateAccountDto = {
      name: 'Cash Wallet',
      type: 1,
      balance: 1000000,
      currency: 1,
      includeInTotal: true,
      isActive: true,
    };

    it('should create a new account successfully', async () => {
      mockAccountRepository.create.mockReturnValue(mockAccount);
      mockAccountRepository.save.mockResolvedValue(mockAccount);

      const result = await service.create(mockUserId, createDto);

      expect(mockAccountRepository.create).toHaveBeenCalledWith({
        ...createDto,
        userId: mockUserId,
        balance: createDto.balance,
      });
      expect(mockAccountRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockAccount);
    });

    it('should create account with default balance 0 if not provided', async () => {
      const dtoWithoutBalance = { ...createDto };
      delete dtoWithoutBalance.balance;

      const accountWithZeroBalance = { ...mockAccount, balance: 0 };
      mockAccountRepository.create.mockReturnValue(accountWithZeroBalance);
      mockAccountRepository.save.mockResolvedValue(accountWithZeroBalance);

      const result = await service.create(mockUserId, dtoWithoutBalance);

      expect(mockAccountRepository.create).toHaveBeenCalledWith({
        ...dtoWithoutBalance,
        userId: mockUserId,
        balance: 0,
      });
      expect(result.balance).toBe(0);
    });
  });

  describe('findAll', () => {
    it('should return all accounts for a user', async () => {
      const mockAccounts = [mockAccount, { ...mockAccount, id: 'account-789' }];
      mockAccountRepository.find.mockResolvedValue(mockAccounts);

      const result = await service.findAll(mockUserId);

      expect(mockAccountRepository.find).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(mockAccounts);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when user has no accounts', async () => {
      mockAccountRepository.find.mockResolvedValue([]);

      const result = await service.findAll(mockUserId);

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return an account when it exists', async () => {
      mockAccountRepository.findOne.mockResolvedValue(mockAccount);

      const result = await service.findOne(mockUserId, mockAccountId);

      expect(mockAccountRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockAccountId, userId: mockUserId },
      });
      expect(result).toEqual(mockAccount);
    });

    it('should throw NotFoundException when account does not exist', async () => {
      mockAccountRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(mockUserId, 'non-existent-id')).rejects.toThrow(NotFoundException);
      await expect(service.findOne(mockUserId, 'non-existent-id')).rejects.toThrow('Account not found');
    });

    it('should throw NotFoundException when account belongs to different user', async () => {
      mockAccountRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('different-user-id', mockAccountId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateDto: UpdateAccountDto = {
      name: 'Updated Wallet',
      balance: 2000000,
    };

    it('should update account successfully', async () => {
      const updatedAccount = { ...mockAccount, ...updateDto };
      mockAccountRepository.findOne.mockResolvedValue(mockAccount);
      mockAccountRepository.save.mockResolvedValue(updatedAccount);

      const result = await service.update(mockUserId, mockAccountId, updateDto);

      expect(mockAccountRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockAccountId, userId: mockUserId },
      });
      expect(mockAccountRepository.save).toHaveBeenCalled();
      expect(result.name).toBe(updateDto.name);
      expect(result.balance).toBe(updateDto.balance);
    });

    it('should throw NotFoundException when account does not exist', async () => {
      mockAccountRepository.findOne.mockResolvedValue(null);

      await expect(service.update(mockUserId, 'non-existent-id', updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should soft delete account successfully', async () => {
      mockAccountRepository.findOne.mockResolvedValue(mockAccount);
      mockAccountRepository.softDelete.mockResolvedValue({ affected: 1 });

      await service.remove(mockUserId, mockAccountId);

      expect(mockAccountRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockAccountId, userId: mockUserId },
      });
      expect(mockAccountRepository.softDelete).toHaveBeenCalledWith(mockAccountId);
    });

    it('should throw NotFoundException when account does not exist', async () => {
      mockAccountRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(mockUserId, 'non-existent-id')).rejects.toThrow(NotFoundException);
      expect(mockAccountRepository.softDelete).not.toHaveBeenCalled();
    });
  });

  describe('getTotalBalance', () => {
    it('should calculate total balance from active accounts included in total', async () => {
      const accounts = [
        { ...mockAccount, balance: 1000000, includeInTotal: true, isActive: true },
        { ...mockAccount, id: 'account-2', balance: 2000000, includeInTotal: true, isActive: true },
        { ...mockAccount, id: 'account-3', balance: 500000, includeInTotal: false, isActive: true }, // Not included
      ];
      mockAccountRepository.find.mockResolvedValue(accounts.slice(0, 2));

      const result = await service.getTotalBalance(mockUserId);

      expect(mockAccountRepository.find).toHaveBeenCalledWith({
        where: { userId: mockUserId, includeInTotal: true, isActive: true },
      });
      expect(result).toBe(3000000);
    });

    it('should return 0 when user has no accounts included in total', async () => {
      mockAccountRepository.find.mockResolvedValue([]);

      const result = await service.getTotalBalance(mockUserId);

      expect(result).toBe(0);
    });

    it('should handle decimal balances correctly', async () => {
      const accounts = [
        { ...mockAccount, balance: 1000.5 },
        { ...mockAccount, id: 'account-2', balance: 2000.75 },
      ];
      mockAccountRepository.find.mockResolvedValue(accounts);

      const result = await service.getTotalBalance(mockUserId);

      expect(result).toBe(3001.25);
    });
  });
});
