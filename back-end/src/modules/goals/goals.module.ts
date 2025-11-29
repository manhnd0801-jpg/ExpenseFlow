import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from '../../entities/account.entity';
import { Category } from '../../entities/category.entity';
import { GoalTransaction } from '../../entities/goal-transaction.entity';
import { Goal } from '../../entities/goal.entity';
import { Transaction } from '../../entities/transaction.entity';
import { GoalsController } from './goals.controller';
import { GoalsService } from './goals.service';

@Module({
  imports: [TypeOrmModule.forFeature([Goal, Account, Transaction, GoalTransaction, Category])],
  controllers: [GoalsController],
  providers: [GoalsService],
  exports: [GoalsService],
})
export class GoalsModule {}
