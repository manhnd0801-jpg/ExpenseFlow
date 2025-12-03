import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from '../../entities/account.entity';
import { Category } from '../../entities/category.entity';
import { LoanPayment } from '../../entities/loan-payment.entity';
import { Loan } from '../../entities/loan.entity';
import { Transaction } from '../../entities/transaction.entity';
import { LoansController } from './loans.controller';
import { LoansService } from './loans.service';

@Module({
  imports: [TypeOrmModule.forFeature([Loan, LoanPayment, Account, Transaction, Category])],
  controllers: [LoansController],
  providers: [LoansService],
  exports: [LoansService],
})
export class LoansModule {}
