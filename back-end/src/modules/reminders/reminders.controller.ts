import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { ApiRoutes } from '../../common/constants';
import { apiResponseSchema } from '../../common/dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateReminderDto, ReminderResponseDto, UpdateReminderDto } from './dto';
import { RemindersService } from './reminders.service';

@ApiTags('Reminders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller(ApiRoutes.REMINDERS.BASE)
export class RemindersController {
  constructor(private readonly remindersService: RemindersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new reminder' })
  @ApiResponse({
    status: 201,
    description: 'Reminder created successfully',
    ...apiResponseSchema(ReminderResponseDto),
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@Request() req, @Body() createReminderDto: CreateReminderDto): Promise<ReminderResponseDto> {
    const reminder = await this.remindersService.create(req.user.userId, createReminderDto);
    return plainToInstance(ReminderResponseDto, reminder, {
      excludeExtraneousValues: true,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get all reminders for current user' })
  @ApiResponse({
    status: 200,
    description: 'List of reminders',
    type: [ReminderResponseDto],
  })
  async findAll(@Request() req): Promise<ReminderResponseDto[]> {
    const reminders = await this.remindersService.findAll(req.user.userId);
    return plainToInstance(ReminderResponseDto, reminders, {
      excludeExtraneousValues: true,
    }) as any;
  }

  @Get(ApiRoutes.REMINDERS.UPCOMING)
  @ApiOperation({ summary: 'Get upcoming reminders (next 7 days)' })
  @ApiResponse({
    status: 200,
    description: 'List of upcoming reminders',
    type: [ReminderResponseDto],
  })
  async findUpcoming(@Request() req): Promise<ReminderResponseDto[]> {
    const reminders = await this.remindersService.findUpcoming(req.user.userId);
    return plainToInstance(ReminderResponseDto, reminders, {
      excludeExtraneousValues: true,
    }) as any;
  }

  @Get(ApiRoutes.REMINDERS.BY_TYPE)
  @ApiOperation({ summary: 'Get reminders by type' })
  @ApiQuery({
    name: 'type',
    required: true,
    description: '1=Payment, 2=Budget, 3=Goal, 4=Custom',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'List of reminders by type',
    type: [ReminderResponseDto],
  })
  async findByType(@Request() req, @Query('type') type: number): Promise<ReminderResponseDto[]> {
    const reminders = await this.remindersService.findByType(req.user.userId, +type);
    return plainToInstance(ReminderResponseDto, reminders, {
      excludeExtraneousValues: true,
    }) as any;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get reminder by ID' })
  @ApiParam({ name: 'id', description: 'Reminder ID' })
  @ApiResponse({
    status: 200,
    description: 'Reminder details',
    ...apiResponseSchema(ReminderResponseDto),
  })
  @ApiResponse({ status: 404, description: 'Reminder not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findOne(@Request() req, @Param('id') id: string): Promise<ReminderResponseDto> {
    const reminder = await this.remindersService.findOne(id, req.user.userId);
    return plainToInstance(ReminderResponseDto, reminder, {
      excludeExtraneousValues: true,
    });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update reminder' })
  @ApiParam({ name: 'id', description: 'Reminder ID' })
  @ApiResponse({
    status: 200,
    description: 'Reminder updated successfully',
    ...apiResponseSchema(ReminderResponseDto),
  })
  @ApiResponse({ status: 404, description: 'Reminder not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateReminderDto: UpdateReminderDto,
  ): Promise<ReminderResponseDto> {
    const reminder = await this.remindersService.update(id, req.user.userId, updateReminderDto);
    return plainToInstance(ReminderResponseDto, reminder, {
      excludeExtraneousValues: true,
    });
  }

  @Patch(`:id/${ApiRoutes.REMINDERS.COMPLETE}`)
  @ApiOperation({ summary: 'Mark reminder as completed' })
  @ApiParam({ name: 'id', description: 'Reminder ID' })
  @ApiResponse({
    status: 200,
    description: 'Reminder marked as completed',
    ...apiResponseSchema(ReminderResponseDto),
  })
  @ApiResponse({ status: 404, description: 'Reminder not found' })
  async markAsCompleted(@Request() req, @Param('id') id: string): Promise<ReminderResponseDto> {
    const reminder = await this.remindersService.markAsCompleted(id, req.user.userId);
    return plainToInstance(ReminderResponseDto, reminder, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete reminder' })
  @ApiParam({ name: 'id', description: 'Reminder ID' })
  @ApiResponse({ status: 204, description: 'Reminder deleted successfully' })
  @ApiResponse({ status: 404, description: 'Reminder not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async remove(@Request() req, @Param('id') id: string) {
    await this.remindersService.remove(id, req.user.userId);
  }
}
