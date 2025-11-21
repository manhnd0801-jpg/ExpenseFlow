import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetUser } from '../../common/decorators';
import { JwtAuthGuard } from '../../common/guards';
import { DebtsService } from './debts.service';
import { CreateDebtDto, RecordDebtPaymentDto, UpdateDebtDto } from './dto';

@ApiTags('Debts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('debts')
export class DebtsController {
  constructor(private readonly debtsService: DebtsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new debt' })
  async create(@GetUser('id') userId: string, @Body() dto: CreateDebtDto) {
    const data = await this.debtsService.create(userId, dto);
    return { success: true, data, message: 'Debt created successfully' };
  }

  @Get()
  @ApiOperation({ summary: 'Get all debts' })
  async findAll(@GetUser('id') userId: string, @Query('type') type?: number) {
    const data = await this.debtsService.findAll(userId, type);
    return { success: true, data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get debt by ID' })
  async findOne(@GetUser('id') userId: string, @Param('id') id: string) {
    const data = await this.debtsService.findOne(userId, id);
    return { success: true, data };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a debt' })
  async update(@GetUser('id') userId: string, @Param('id') id: string, @Body() dto: UpdateDebtDto) {
    const data = await this.debtsService.update(userId, id, dto);
    return { success: true, data, message: 'Debt updated successfully' };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a debt' })
  async remove(@GetUser('id') userId: string, @Param('id') id: string) {
    await this.debtsService.remove(userId, id);
    return { success: true, message: 'Debt deleted successfully' };
  }

  @Post(':id/payments')
  @ApiOperation({ summary: 'Record a debt payment' })
  async recordPayment(@GetUser('id') userId: string, @Param('id') id: string, @Body() dto: RecordDebtPaymentDto) {
    const data = await this.debtsService.recordPayment(userId, id, dto);
    return { success: true, data, message: 'Payment recorded successfully' };
  }

  @Get(':id/payments')
  @ApiOperation({ summary: 'Get debt payment history' })
  async getPayments(@GetUser('id') userId: string, @Param('id') id: string) {
    const data = await this.debtsService.getPayments(userId, id);
    return { success: true, data };
  }
}
