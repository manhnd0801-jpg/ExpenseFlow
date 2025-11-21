import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from '../../entities/account.entity';
import { CreateAccountDto, UpdateAccountDto } from './dto';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
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
      order: { createdAt: 'DESC' },
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
}
