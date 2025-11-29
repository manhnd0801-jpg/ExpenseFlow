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
      userId,
      type: dto.type,
      personName: dto.personName,
      contactInfo: dto.contactInfo,
      originalAmount: dto.amount, // Map DTO amount -> entity originalAmount
      remainingAmount: dto.amount,
      interestRate: dto.interestRate ?? 0,
      borrowedDate: dto.borrowedDate,
      dueDate: dto.dueDate,
      status: DebtStatus.ACTIVE,
      description: dto.description,
    });
    return await this.debtRepository.save(debt);
  }

  async findAll(userId: string, type?: number): Promise<Debt[]> {
    const where: any = { userId };
    if (type) where.type = type;
    return await this.debtRepository.find({
      where,
      relations: ['payments'],
      order: { updatedAt: 'DESC' },
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

    // Map DTO fields to entity fields
    if (dto.personName !== undefined) debt.personName = dto.personName;
    if (dto.amount !== undefined) {
      debt.originalAmount = dto.amount; // Map DTO amount -> entity originalAmount
      // Recalculate remaining amount based on payments
      const payments = await this.debtPaymentRepository.find({ where: { debtId: id } });
      const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);
      debt.remainingAmount = dto.amount - totalPaid;
    }
    if (dto.interestRate !== undefined) debt.interestRate = dto.interestRate;
    if (dto.dueDate !== undefined) debt.dueDate = dto.dueDate;
    if (dto.description !== undefined) debt.description = dto.description;
    if (dto.contactInfo !== undefined) debt.contactInfo = dto.contactInfo;

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
