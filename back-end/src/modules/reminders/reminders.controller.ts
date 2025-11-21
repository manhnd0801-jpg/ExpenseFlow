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
import { plainToClass } from 'class-transformer';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateReminderDto, ReminderResponseDto, UpdateReminderDto } from './dto';
import { RemindersService } from './reminders.service';

@ApiTags('Reminders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reminders')
export class RemindersController {
  constructor(private readonly remindersService: RemindersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new reminder' })
  @ApiResponse({
    status: 201,
    description: 'Reminder created successfully',
    type: ReminderResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@Request() req, @Body() createReminderDto: CreateReminderDto) {
    const reminder = await this.remindersService.create(req.user.userId, createReminderDto);
    return {
      success: true,
      data: plainToClass(ReminderResponseDto, reminder, {
        excludeExtraneousValues: true,
      }),
      message: 'Reminder created successfully',
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all reminders for current user' })
  @ApiResponse({
    status: 200,
    description: 'List of reminders',
    type: [ReminderResponseDto],
  })
  async findAll(@Request() req) {
    const reminders = await this.remindersService.findAll(req.user.userId);
    return {
      success: true,
      data: plainToClass(ReminderResponseDto, reminders, {
        excludeExtraneousValues: true,
      }),
      message: 'Reminders retrieved successfully',
    };
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Get upcoming reminders (next 7 days)' })
  @ApiResponse({
    status: 200,
    description: 'List of upcoming reminders',
    type: [ReminderResponseDto],
  })
  async findUpcoming(@Request() req) {
    const reminders = await this.remindersService.findUpcoming(req.user.userId);
    return {
      success: true,
      data: plainToClass(ReminderResponseDto, reminders, {
        excludeExtraneousValues: true,
      }),
      message: 'Upcoming reminders retrieved successfully',
    };
  }

  @Get('by-type')
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
  async findByType(@Request() req, @Query('type') type: number) {
    const reminders = await this.remindersService.findByType(req.user.userId, +type);
    return {
      success: true,
      data: plainToClass(ReminderResponseDto, reminders, {
        excludeExtraneousValues: true,
      }),
      message: 'Reminders retrieved successfully',
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get reminder by ID' })
  @ApiParam({ name: 'id', description: 'Reminder ID' })
  @ApiResponse({
    status: 200,
    description: 'Reminder details',
    type: ReminderResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Reminder not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findOne(@Request() req, @Param('id') id: string) {
    const reminder = await this.remindersService.findOne(id, req.user.userId);
    return {
      success: true,
      data: plainToClass(ReminderResponseDto, reminder, {
        excludeExtraneousValues: true,
      }),
      message: 'Reminder retrieved successfully',
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update reminder' })
  @ApiParam({ name: 'id', description: 'Reminder ID' })
  @ApiResponse({
    status: 200,
    description: 'Reminder updated successfully',
    type: ReminderResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Reminder not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async update(@Request() req, @Param('id') id: string, @Body() updateReminderDto: UpdateReminderDto) {
    const reminder = await this.remindersService.update(id, req.user.userId, updateReminderDto);
    return {
      success: true,
      data: plainToClass(ReminderResponseDto, reminder, {
        excludeExtraneousValues: true,
      }),
      message: 'Reminder updated successfully',
    };
  }

  @Patch(':id/complete')
  @ApiOperation({ summary: 'Mark reminder as completed' })
  @ApiParam({ name: 'id', description: 'Reminder ID' })
  @ApiResponse({
    status: 200,
    description: 'Reminder marked as completed',
    type: ReminderResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Reminder not found' })
  async markAsCompleted(@Request() req, @Param('id') id: string) {
    const reminder = await this.remindersService.markAsCompleted(id, req.user.userId);
    return {
      success: true,
      data: plainToClass(ReminderResponseDto, reminder, {
        excludeExtraneousValues: true,
      }),
      message: 'Reminder marked as completed',
    };
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
