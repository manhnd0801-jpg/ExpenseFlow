import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { TransactionType } from '../../common/constants/enums';
import { Account } from '../../entities/account.entity';
import { Transaction } from '../../entities/transaction.entity';
import { CreateAccountDto, TransferDto, UpdateAccountDto } from './dto';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    private readonly dataSource: DataSource,
  ) {}

  async create(userId: string, dto: CreateAccountDto): Promise<Account> {
    const account = this.accountRepository.create({
      ...dto,
      userId,
      balance: dto.balance || 0,
    });
    return await this.accountRepository.save(account);
  }

  async findAll(userId: string): Promise<Account[]> {
    return await this.accountRepository.find({
      where: { userId },
      order: { updatedAt: 'DESC' },
    });
  }

  async findOne(userId: string, id: string): Promise<Account> {
    const account = await this.accountRepository.findOne({
      where: { id, userId },
    });
    if (!account) throw new NotFoundException('Account not found');
    return account;
  }

  async update(userId: string, id: string, dto: UpdateAccountDto): Promise<Account> {
    const account = await this.findOne(userId, id);
    Object.assign(account, dto);
    return await this.accountRepository.save(account);
  }

  async remove(userId: string, id: string): Promise<void> {
    await this.findOne(userId, id);
    await this.accountRepository.softDelete(id);
  }

  async getTotalBalance(userId: string): Promise<number> {
    const accounts = await this.accountRepository.find({
      where: { userId, includeInTotal: true, isActive: true },
    });
    return accounts.reduce((sum, acc) => sum + Number(acc.balance), 0);
  }

  /**
   * Transfer money between accounts
   * Creates a TRANSFER transaction and updates both account balances
   */
  async transfer(userId: string, fromAccountId: string, dto: TransferDto): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Validate accounts exist and belong to user
      const fromAccount = await this.findOne(userId, fromAccountId);
      const toAccount = await this.findOne(userId, dto.toAccountId);

      // Validate transfer is not to same account
      if (fromAccountId === dto.toAccountId) {
        throw new BadRequestException('Cannot transfer to the same account');
      }

      // Validate sufficient balance
      if (fromAccount.balance < dto.amount) {
        throw new BadRequestException('Insufficient balance');
      }

      // Validate amount is positive
      if (dto.amount <= 0) {
        throw new BadRequestException('Transfer amount must be positive');
      }

      // Update account balances
      fromAccount.balance = Number(fromAccount.balance) - Number(dto.amount);
      toAccount.balance = Number(toAccount.balance) + Number(dto.amount);

      await queryRunner.manager.save(fromAccount);
      await queryRunner.manager.save(toAccount);

      // Create transfer transaction
      const transaction = this.transactionRepository.create({
        userId,
        accountId: fromAccountId,
        toAccountId: dto.toAccountId,
        type: TransactionType.TRANSFER,
        amount: dto.amount,
        date: new Date(),
        description: dto.description || `Transfer from ${fromAccount.name} to ${toAccount.name}`,
      });

      await queryRunner.manager.save(transaction);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
