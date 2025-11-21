import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetUser } from '../../common/decorators';
import { JwtAuthGuard } from '../../common/guards';
import { CreateEventDto, UpdateEventDto } from './dto';
import { EventsService } from './events.service';

@ApiTags('Events')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new event' })
  async create(@GetUser('id') userId: string, @Body() dto: CreateEventDto) {
    const data = await this.eventsService.create(userId, dto);
    return { success: true, data, message: 'Event created successfully' };
  }

  @Get()
  @ApiOperation({ summary: 'Get all events' })
  async findAll(@GetUser('id') userId: string) {
    const data = await this.eventsService.findAll(userId);
    return { success: true, data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get event by ID' })
  async findOne(@GetUser('id') userId: string, @Param('id') id: string) {
    const data = await this.eventsService.findOne(userId, id);
    return { success: true, data };
  }

  @Get(':id/summary')
  @ApiOperation({ summary: 'Get event summary with spending' })
  async getSummary(@GetUser('id') userId: string, @Param('id') id: string) {
    const data = await this.eventsService.getEventSummary(userId, id);
    return { success: true, data };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an event' })
  async update(@GetUser('id') userId: string, @Param('id') id: string, @Body() dto: UpdateEventDto) {
    const data = await this.eventsService.update(userId, id, dto);
    return { success: true, data, message: 'Event updated successfully' };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an event' })
  async remove(@GetUser('id') userId: string, @Param('id') id: string) {
    await this.eventsService.remove(userId, id);
    return { success: true, message: 'Event deleted successfully' };
  }
}
