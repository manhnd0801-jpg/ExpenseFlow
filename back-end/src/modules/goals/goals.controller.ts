import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetUser } from '../../common/decorators';
import { JwtAuthGuard } from '../../common/guards';
import { ContributeGoalDto, CreateGoalDto, UpdateGoalDto } from './dto';
import { GoalsService } from './goals.service';

@ApiTags('Goals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('goals')
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new goal' })
  async create(@GetUser('id') userId: string, @Body() dto: CreateGoalDto) {
    const data = await this.goalsService.create(userId, dto);
    return { success: true, data, message: 'Goal created successfully' };
  }

  @Get()
  @ApiOperation({ summary: 'Get all goals' })
  async findAll(@GetUser('id') userId: string) {
    const data = await this.goalsService.findAll(userId);
    return { success: true, data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get goal by ID' })
  async findOne(@GetUser('id') userId: string, @Param('id') id: string) {
    const data = await this.goalsService.findOne(userId, id);
    return { success: true, data };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a goal' })
  async update(@GetUser('id') userId: string, @Param('id') id: string, @Body() dto: UpdateGoalDto) {
    const data = await this.goalsService.update(userId, id, dto);
    return { success: true, data, message: 'Goal updated successfully' };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a goal' })
  async remove(@GetUser('id') userId: string, @Param('id') id: string) {
    await this.goalsService.remove(userId, id);
    return { success: true, message: 'Goal deleted successfully' };
  }

  @Post(':id/contribute')
  @ApiOperation({ summary: 'Contribute to a goal' })
  async contribute(@GetUser('id') userId: string, @Param('id') id: string, @Body() dto: ContributeGoalDto) {
    const data = await this.goalsService.contribute(userId, id, dto);
    return { success: true, data, message: 'Contribution recorded successfully' };
  }
}
