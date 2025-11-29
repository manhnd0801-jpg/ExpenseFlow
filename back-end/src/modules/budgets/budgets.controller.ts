import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { ApiRoutes } from '../../common/constants';
import { GetUser } from '../../common/decorators';
import { apiResponseSchema } from '../../common/dto';
import { JwtAuthGuard } from '../../common/guards';
import { BudgetsService } from './budgets.service';
import { BudgetResponseDto, CreateBudgetDto, UpdateBudgetDto } from './dto';

@ApiTags('Budgets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller(ApiRoutes.BUDGETS.BASE)
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new budget' })
  @ApiResponse({
    status: 201,
    description: 'Budget created successfully',
    ...apiResponseSchema(BudgetResponseDto),
  })
  async create(@GetUser('id') userId: string, @Body() dto: CreateBudgetDto): Promise<BudgetResponseDto> {
    const budget = await this.budgetsService.create(userId, dto);
    return plainToInstance(BudgetResponseDto, budget, { excludeExtraneousValues: false });
  }

  @Get()
  @ApiOperation({ summary: 'Get all budgets' })
  @ApiResponse({
    status: 200,
    description: 'Budgets retrieved successfully',
    type: [BudgetResponseDto],
  })
  async findAll(@GetUser('id') userId: string): Promise<BudgetResponseDto[]> {
    const budgets = await this.budgetsService.findAll(userId);
    return plainToInstance(BudgetResponseDto, budgets, { excludeExtraneousValues: false }) as any;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get budget by ID' })
  @ApiResponse({
    status: 200,
    description: 'Budget retrieved successfully',
    ...apiResponseSchema(BudgetResponseDto),
  })
  @ApiResponse({ status: 404, description: 'Budget not found' })
  async findOne(@GetUser('id') userId: string, @Param('id') id: string): Promise<BudgetResponseDto> {
    const budget = await this.budgetsService.findOne(userId, id);
    return plainToInstance(BudgetResponseDto, budget, { excludeExtraneousValues: false });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a budget' })
  @ApiResponse({
    status: 200,
    description: 'Budget updated successfully',
    ...apiResponseSchema(BudgetResponseDto),
  })
  @ApiResponse({ status: 404, description: 'Budget not found' })
  async update(
    @GetUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateBudgetDto,
  ): Promise<BudgetResponseDto> {
    const budget = await this.budgetsService.update(userId, id, dto);
    return plainToInstance(BudgetResponseDto, budget, { excludeExtraneousValues: false });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a budget' })
  @ApiResponse({
    status: 204,
    description: 'Budget deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Budget not found' })
  async remove(@GetUser('id') userId: string, @Param('id') id: string): Promise<void> {
    await this.budgetsService.remove(userId, id);
  }
}
