import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoanPayment } from '../../entities/loan-payment.entity';
import { Loan } from '../../entities/loan.entity';
import { LoansController } from './loans.controller';
import { LoansService } from './loans.service';

@Module({
  imports: [TypeOrmModule.forFeature([Loan, LoanPayment])],
  controllers: [LoansController],
  providers: [LoansService],
  exports: [LoansService],
})
export class LoansModule {}
