import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DebtStatus } from '../../common/constants/enums';
import { DebtPayment } from '../../entities/debt-payment.entity';
import { Debt } from '../../entities/debt.entity';
import { CreateDebtDto, RecordDebtPaymentDto, UpdateDebtDto } from './dto';

@Injectable()
export class DebtsService {
  constructor(
    @InjectRepository(Debt)
    private readonly debtRepository: Repository<Debt>,
    @InjectRepository(DebtPayment)
    private readonly debtPaymentRepository: Repository<DebtPayment>,
  ) {}

  async create(userId: string, dto: CreateDebtDto): Promise<Debt> {
    const debt = this.debtRepository.create({
      ...dto,
      userId,
      remainingAmount: dto.amount,
      status: DebtStatus.ACTIVE,
    });
    return await this.debtRepository.save(debt);
  }

  async findAll(userId: string, type?: number): Promise<Debt[]> {
    const where: any = { userId };
    if (type) where.type = type;
    return await this.debtRepository.find({
      where,
      relations: ['payments'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(userId: string, id: string): Promise<Debt> {
    const debt = await this.debtRepository.findOne({
      where: { id, userId },
      relations: ['payments'],
    });
    if (!debt) throw new NotFoundException('Debt not found');
    return debt;
  }

  async update(userId: string, id: string, dto: UpdateDebtDto): Promise<Debt> {
    const debt = await this.findOne(userId, id);
    Object.assign(debt, dto);
    return await this.debtRepository.save(debt);
  }

  async remove(userId: string, id: string): Promise<void> {
    await this.findOne(userId, id);
    await this.debtRepository.softDelete(id);
  }

  async recordPayment(userId: string, debtId: string, dto: RecordDebtPaymentDto): Promise<DebtPayment> {
    const debt = await this.findOne(userId, debtId);

    return await this.debtRepository.manager.transaction(async (manager) => {
      const payment = this.debtPaymentRepository.create({
        debtId,
        ...dto,
      });
      const savedPayment = await manager.save(DebtPayment, payment);

      // Update debt remaining amount and status
      debt.remainingAmount = Number(debt.remainingAmount) - Number(dto.amount);
      if (debt.remainingAmount <= 0) {
        debt.remainingAmount = 0;
        debt.status = DebtStatus.PAID;
      } else {
        debt.status = DebtStatus.PARTIAL;
      }
      await manager.save(Debt, debt);

      return savedPayment;
    });
  }

  async getPayments(userId: string, debtId: string): Promise<DebtPayment[]> {
    await this.findOne(userId, debtId);
    return await this.debtPaymentRepository.find({
      where: { debtId },
      order: { paymentDate: 'DESC' },
    });
  }
}
