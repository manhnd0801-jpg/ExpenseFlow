import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetUser } from '../../common/decorators';
import { JwtAuthGuard } from '../../common/guards';
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto, UpdateBudgetDto } from './dto';

@ApiTags('Budgets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('budgets')
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new budget' })
  async create(@GetUser('id') userId: string, @Body() dto: CreateBudgetDto) {
    const data = await this.budgetsService.create(userId, dto);
    return { success: true, data, message: 'Budget created successfully' };
  }

  @Get()
  @ApiOperation({ summary: 'Get all budgets' })
  async findAll(@GetUser('id') userId: string) {
    const data = await this.budgetsService.findAll(userId);
    return { success: true, data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get budget by ID' })
  async findOne(@GetUser('id') userId: string, @Param('id') id: string) {
    const data = await this.budgetsService.findOne(userId, id);
    return { success: true, data };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a budget' })
  async update(@GetUser('id') userId: string, @Param('id') id: string, @Body() dto: UpdateBudgetDto) {
    const data = await this.budgetsService.update(userId, id, dto);
    return { success: true, data, message: 'Budget updated successfully' };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a budget' })
  async remove(@GetUser('id') userId: string, @Param('id') id: string) {
    await this.budgetsService.remove(userId, id);
    return { success: true, message: 'Budget deleted successfully' };
  }
}
