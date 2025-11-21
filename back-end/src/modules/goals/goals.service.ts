import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GoalStatus } from '../../common/constants/enums';
import { Goal } from '../../entities/goal.entity';
import { ContributeGoalDto, CreateGoalDto, UpdateGoalDto } from './dto';

@Injectable()
export class GoalsService {
  constructor(
    @InjectRepository(Goal)
    private readonly goalRepository: Repository<Goal>,
  ) {}

  async create(userId: string, dto: CreateGoalDto): Promise<Goal> {
    const goal = this.goalRepository.create({
      ...dto,
      userId,
      currentAmount: dto.currentAmount || 0,
      status: GoalStatus.ACTIVE,
    });
    return await this.goalRepository.save(goal);
  }

  async findAll(userId: string): Promise<Goal[]> {
    return await this.goalRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(userId: string, id: string): Promise<Goal> {
    const goal = await this.goalRepository.findOne({ where: { id, userId } });
    if (!goal) throw new NotFoundException('Goal not found');
    return goal;
  }

  async update(userId: string, id: string, dto: UpdateGoalDto): Promise<Goal> {
    const goal = await this.findOne(userId, id);
    Object.assign(goal, dto);

    // Update status if target reached
    if (goal.currentAmount >= goal.targetAmount) {
      goal.status = GoalStatus.COMPLETED;
    }

    return await this.goalRepository.save(goal);
  }

  async remove(userId: string, id: string): Promise<void> {
    await this.findOne(userId, id);
    await this.goalRepository.softDelete(id);
  }

  async contribute(userId: string, id: string, dto: ContributeGoalDto): Promise<Goal> {
    const goal = await this.findOne(userId, id);
    goal.currentAmount = Number(goal.currentAmount) + Number(dto.amount);

    // Check if goal completed
    if (goal.currentAmount >= goal.targetAmount) {
      goal.status = GoalStatus.COMPLETED;
    }

    return await this.goalRepository.save(goal);
  }
}
