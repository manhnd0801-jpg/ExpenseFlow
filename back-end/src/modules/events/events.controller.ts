import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiRoutes } from '../../common/constants';
import { GetUser } from '../../common/decorators';
import { JwtAuthGuard } from '../../common/guards';
import { CreateEventDto, UpdateEventDto } from './dto';
import { EventsService } from './events.service';

@ApiTags('Events')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller(ApiRoutes.EVENTS.BASE)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new event' })
  @ApiResponse({ status: 201, description: 'Event created successfully' })
  async create(@GetUser('id') userId: string, @Body() dto: CreateEventDto) {
    return await this.eventsService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all events' })
  @ApiResponse({ status: 200, description: 'Events retrieved successfully' })
  async findAll(@GetUser('id') userId: string) {
    return await this.eventsService.findAll(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get event by ID' })
  @ApiResponse({ status: 200, description: 'Event retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async findOne(@GetUser('id') userId: string, @Param('id') id: string) {
    return await this.eventsService.findOne(userId, id);
  }

  @Get(`:id/${ApiRoutes.EVENTS.SUMMARY}`)
  @ApiOperation({ summary: 'Get event summary with spending' })
  @ApiResponse({ status: 200, description: 'Event summary retrieved successfully' })
  async getSummary(@GetUser('id') userId: string, @Param('id') id: string) {
    return await this.eventsService.getEventSummary(userId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an event' })
  @ApiResponse({ status: 200, description: 'Event updated successfully' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async update(@GetUser('id') userId: string, @Param('id') id: string, @Body() dto: UpdateEventDto) {
    return await this.eventsService.update(userId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an event' })
  @ApiResponse({ status: 204, description: 'Event deleted successfully' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async remove(@GetUser('id') userId: string, @Param('id') id: string): Promise<void> {
    await this.eventsService.remove(userId, id);
  }
}
