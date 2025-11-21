import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventStatus } from '../../common/constants/enums';
import { Event } from '../../entities/event.entity';
import { CreateEventDto, UpdateEventDto } from './dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) {}

  async create(userId: string, dto: CreateEventDto): Promise<Event> {
    const event = this.eventRepository.create({
      ...dto,
      userId,
      status: EventStatus.PLANNED,
    });
    return await this.eventRepository.save(event);
  }

  async findAll(userId: string): Promise<Event[]> {
    return await this.eventRepository.find({
      where: { userId },
      relations: ['transactions'],
      order: { startDate: 'DESC' },
    });
  }

  async findOne(userId: string, id: string): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: { id, userId },
      relations: ['transactions'],
    });
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async update(userId: string, id: string, dto: UpdateEventDto): Promise<Event> {
    const event = await this.findOne(userId, id);
    Object.assign(event, dto);
    return await this.eventRepository.save(event);
  }

  async remove(userId: string, id: string): Promise<void> {
    await this.findOne(userId, id);
    await this.eventRepository.softDelete(id);
  }

  async getEventSummary(userId: string, id: string): Promise<any> {
    const event = await this.findOne(userId, id);
    const totalSpent = event.transactions?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;

    return {
      ...event,
      totalSpent,
      remaining: event.budget ? Number(event.budget) - totalSpent : null,
      transactionCount: event.transactions?.length || 0,
    };
  }
}
