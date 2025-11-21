import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reminder } from '../../entities/reminder.entity';
import { CreateReminderDto, UpdateReminderDto } from './dto';

@Injectable()
export class RemindersService {
  constructor(
    @InjectRepository(Reminder)
    private readonly reminderRepository: Repository<Reminder>,
  ) {}

  /**
   * Create a new reminder
   */
  async create(userId: string, createReminderDto: CreateReminderDto): Promise<Reminder> {
    const reminder = this.reminderRepository.create({
      userId,
      title: createReminderDto.title,
      description: createReminderDto.description,
      type: createReminderDto.type as any,
      dueDate: createReminderDto.reminderDate,
      frequency: (createReminderDto.recurringType as any) || 1,
      isActive: true,
      isCompleted: false,
    });

    return await this.reminderRepository.save(reminder);
  }

  /**
   * Get all reminders for a user
   */
  async findAll(userId: string): Promise<Reminder[]> {
    return await this.reminderRepository.find({
      where: { userId, deletedAt: null as any },
      order: { dueDate: 'ASC' },
    });
  }

  /**
   * Get upcoming reminders (next 7 days)
   */
  async findUpcoming(userId: string): Promise<Reminder[]> {
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);

    return await this.reminderRepository
      .createQueryBuilder('reminder')
      .where('reminder.userId = :userId', { userId })
      .andWhere('reminder.deletedAt IS NULL')
      .andWhere('reminder.isCompleted = :isCompleted', { isCompleted: false })
      .andWhere('reminder.dueDate >= :now', { now })
      .andWhere('reminder.dueDate <= :nextWeek', { nextWeek })
      .orderBy('reminder.dueDate', 'ASC')
      .getMany();
  }

  /**
   * Get reminder by ID
   */
  async findOne(id: string, userId: string): Promise<Reminder> {
    const reminder = await this.reminderRepository.findOne({
      where: { id, deletedAt: null as any },
    });

    if (!reminder) {
      throw new NotFoundException(`Reminder with ID ${id} not found`);
    }

    if (reminder.userId !== userId) {
      throw new ForbiddenException('You do not have permission to access this reminder');
    }

    return reminder;
  }

  /**
   * Update reminder
   */
  async update(id: string, userId: string, updateReminderDto: UpdateReminderDto): Promise<Reminder> {
    const reminder = await this.findOne(id, userId);

    if (updateReminderDto.title) reminder.title = updateReminderDto.title;
    if (updateReminderDto.description !== undefined) reminder.description = updateReminderDto.description;
    if (updateReminderDto.type) reminder.type = updateReminderDto.type as any;
    if (updateReminderDto.reminderDate) reminder.dueDate = updateReminderDto.reminderDate;
    if (updateReminderDto.recurringType) reminder.frequency = updateReminderDto.recurringType as any;

    reminder.updatedAt = new Date();

    return await this.reminderRepository.save(reminder);
  }

  /**
   * Mark reminder as completed
   */
  async markAsCompleted(id: string, userId: string): Promise<Reminder> {
    const reminder = await this.findOne(id, userId);
    reminder.isCompleted = true;
    reminder.completedAt = new Date();
    reminder.updatedAt = new Date();

    return await this.reminderRepository.save(reminder);
  }

  /**
   * Delete reminder (soft delete)
   */
  async remove(id: string, userId: string): Promise<void> {
    const reminder = await this.findOne(id, userId);
    reminder.deletedAt = new Date();
    await this.reminderRepository.save(reminder);
  }

  /**
   * Get reminders by type
   */
  async findByType(userId: string, type: number): Promise<Reminder[]> {
    return await this.reminderRepository.find({
      where: { userId, type: type as any, deletedAt: null as any },
      order: { dueDate: 'ASC' },
    });
  }
}
