import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GoalStatus } from '../../common/constants/enums';
import { Goal } from '../../entities/goal.entity';
import { ContributeGoalDto, CreateGoalDto, UpdateGoalDto } from './dto';
import { GoalsService } from './goals.service';

describe('GoalsService', () => {
  let service: GoalsService;
  let goalRepository: Repository<Goal>;

  const mockUserId = 'user-123';
  const mockGoalId = 'goal-456';

  const mockGoal: Partial<Goal> = {
    id: mockGoalId,
    userId: mockUserId,
    name: 'New Car',
    targetAmount: 500000000,
    currentAmount: 100000000,
    targetDate: new Date('2025-12-31'),
    status: GoalStatus.ACTIVE,
    icon: 'car',
    color: '#FF6B6B',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockGoalRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoalsService,
        {
          provide: getRepositoryToken(Goal),
          useValue: mockGoalRepository,
        },
      ],
    }).compile();

    service = module.get<GoalsService>(GoalsService);
    goalRepository = module.get<Repository<Goal>>(getRepositoryToken(Goal));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateGoalDto = {
      name: 'New Car',
      targetAmount: 500000000,
      currentAmount: 100000000,
      deadline: new Date('2025-12-31'),
    };

    it('should create a new goal successfully', async () => {
      mockGoalRepository.create.mockReturnValue(mockGoal);
      mockGoalRepository.save.mockResolvedValue(mockGoal);

      const result = await service.create(mockUserId, createDto);

      expect(mockGoalRepository.create).toHaveBeenCalledWith({
        ...createDto,
        userId: mockUserId,
        currentAmount: createDto.currentAmount,
        status: GoalStatus.ACTIVE,
      });
      expect(mockGoalRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockGoal);
    });

    it('should create goal with default currentAmount 0 if not provided', async () => {
      const dtoWithoutCurrent = { ...createDto };
      delete dtoWithoutCurrent.currentAmount;

      const goalWithZero = { ...mockGoal, currentAmount: 0 };
      mockGoalRepository.create.mockReturnValue(goalWithZero);
      mockGoalRepository.save.mockResolvedValue(goalWithZero);

      const result = await service.create(mockUserId, dtoWithoutCurrent);

      expect(mockGoalRepository.create).toHaveBeenCalledWith({
        ...dtoWithoutCurrent,
        userId: mockUserId,
        currentAmount: 0,
        status: GoalStatus.ACTIVE,
      });
      expect(result.currentAmount).toBe(0);
    });
  });

  describe('findAll', () => {
    it('should return all goals for a user', async () => {
      const mockGoals = [mockGoal, { ...mockGoal, id: 'goal-789' }];
      mockGoalRepository.find.mockResolvedValue(mockGoals);

      const result = await service.findAll(mockUserId);

      expect(mockGoalRepository.find).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(mockGoals);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when user has no goals', async () => {
      mockGoalRepository.find.mockResolvedValue([]);

      const result = await service.findAll(mockUserId);

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a goal when it exists', async () => {
      mockGoalRepository.findOne.mockResolvedValue(mockGoal);

      const result = await service.findOne(mockUserId, mockGoalId);

      expect(mockGoalRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockGoalId, userId: mockUserId },
      });
      expect(result).toEqual(mockGoal);
    });

    it('should throw NotFoundException when goal does not exist', async () => {
      mockGoalRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(mockUserId, 'non-existent-id')).rejects.toThrow(NotFoundException);
      await expect(service.findOne(mockUserId, 'non-existent-id')).rejects.toThrow('Goal not found');
    });
  });

  describe('update', () => {
    const updateDto: UpdateGoalDto = {
      name: 'Updated Goal',
      targetAmount: 600000000,
    };

    it('should update goal successfully', async () => {
      const updatedGoal = { ...mockGoal, ...updateDto };
      mockGoalRepository.findOne.mockResolvedValue(mockGoal);
      mockGoalRepository.save.mockResolvedValue(updatedGoal);

      const result = await service.update(mockUserId, mockGoalId, updateDto);

      expect(mockGoalRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockGoalId, userId: mockUserId },
      });
      expect(mockGoalRepository.save).toHaveBeenCalled();
      expect(result.name).toBe(updateDto.name);
      expect(result.targetAmount).toBe(updateDto.targetAmount);
    });

    it('should update status to COMPLETED when target is reached', async () => {
      const goalReachedTarget = { ...mockGoal, currentAmount: 600000000, targetAmount: 500000000 };
      mockGoalRepository.findOne.mockResolvedValue(goalReachedTarget);
      mockGoalRepository.save.mockResolvedValue({ ...goalReachedTarget, status: GoalStatus.COMPLETED });

      const result = await service.update(mockUserId, mockGoalId, {});

      expect(result.status).toBe(GoalStatus.COMPLETED);
    });

    it('should throw NotFoundException when goal does not exist', async () => {
      mockGoalRepository.findOne.mockResolvedValue(null);

      await expect(service.update(mockUserId, 'non-existent-id', updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should soft delete goal successfully', async () => {
      mockGoalRepository.findOne.mockResolvedValue(mockGoal);
      mockGoalRepository.softDelete.mockResolvedValue({ affected: 1 });

      await service.remove(mockUserId, mockGoalId);

      expect(mockGoalRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockGoalId, userId: mockUserId },
      });
      expect(mockGoalRepository.softDelete).toHaveBeenCalledWith(mockGoalId);
    });

    it('should throw NotFoundException when goal does not exist', async () => {
      mockGoalRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(mockUserId, 'non-existent-id')).rejects.toThrow(NotFoundException);
      expect(mockGoalRepository.softDelete).not.toHaveBeenCalled();
    });
  });

  describe('contribute', () => {
    const contributeDto: ContributeGoalDto = {
      amount: 50000000,
    };

    it('should add contribution to goal successfully', async () => {
      const updatedGoal = { ...mockGoal, currentAmount: 150000000 };
      mockGoalRepository.findOne.mockResolvedValue(mockGoal);
      mockGoalRepository.save.mockResolvedValue(updatedGoal);

      const result = await service.contribute(mockUserId, mockGoalId, contributeDto);

      expect(mockGoalRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockGoalId, userId: mockUserId },
      });
      expect(mockGoalRepository.save).toHaveBeenCalled();
      expect(result.currentAmount).toBe(150000000);
    });

    it('should mark goal as COMPLETED when target is reached', async () => {
      const contributeDto: ContributeGoalDto = {
        amount: 400000000, // This will complete the goal
      };

      const completedGoal = {
        ...mockGoal,
        currentAmount: 500000000,
        status: GoalStatus.COMPLETED,
      };
      mockGoalRepository.findOne.mockResolvedValue(mockGoal);
      mockGoalRepository.save.mockResolvedValue(completedGoal);

      const result = await service.contribute(mockUserId, mockGoalId, contributeDto);

      expect(result.status).toBe(GoalStatus.COMPLETED);
      expect(result.currentAmount).toBe(500000000);
    });

    it('should throw NotFoundException when goal does not exist', async () => {
      mockGoalRepository.findOne.mockResolvedValue(null);

      await expect(service.contribute(mockUserId, 'non-existent-id', contributeDto)).rejects.toThrow(NotFoundException);
      expect(mockGoalRepository.save).not.toHaveBeenCalled();
    });
  });
});
