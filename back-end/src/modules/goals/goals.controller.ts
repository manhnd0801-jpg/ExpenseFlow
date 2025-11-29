import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiRoutes } from '../../common/constants';
import { GetUser } from '../../common/decorators';
import { JwtAuthGuard } from '../../common/guards';
import { ContributeGoalDto, CreateGoalDto, UpdateGoalDto } from './dto';
import { GoalsService } from './goals.service';

@ApiTags('Goals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller(ApiRoutes.GOALS.BASE)
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new goal' })
  @ApiResponse({ status: 201, description: 'Goal created successfully' })
  async create(@GetUser('id') userId: string, @Body() dto: CreateGoalDto) {
    return await this.goalsService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all goals' })
  @ApiResponse({ status: 200, description: 'Goals retrieved successfully' })
  async findAll(@GetUser('id') userId: string) {
    return await this.goalsService.findAll(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get goal by ID' })
  @ApiResponse({ status: 200, description: 'Goal retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Goal not found' })
  async findOne(@GetUser('id') userId: string, @Param('id') id: string) {
    return await this.goalsService.findOne(userId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a goal' })
  @ApiResponse({ status: 200, description: 'Goal updated successfully' })
  @ApiResponse({ status: 404, description: 'Goal not found' })
  async update(@GetUser('id') userId: string, @Param('id') id: string, @Body() dto: UpdateGoalDto) {
    return await this.goalsService.update(userId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a goal' })
  @ApiResponse({ status: 204, description: 'Goal deleted successfully' })
  @ApiResponse({ status: 404, description: 'Goal not found' })
  async remove(@GetUser('id') userId: string, @Param('id') id: string): Promise<void> {
    await this.goalsService.remove(userId, id);
  }

  @Post(`:id/${ApiRoutes.GOALS.CONTRIBUTE}`)
  @ApiOperation({ summary: 'Contribute to a goal' })
  @ApiResponse({ status: 200, description: 'Contribution recorded successfully' })
  async contribute(@GetUser('id') userId: string, @Param('id') id: string, @Body() dto: ContributeGoalDto) {
    return await this.goalsService.contribute(userId, id, dto);
  }
}
