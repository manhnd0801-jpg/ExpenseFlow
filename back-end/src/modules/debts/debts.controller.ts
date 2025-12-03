import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiRoutes } from '../../common/constants';
import { GetUser } from '../../common/decorators';
import { JwtAuthGuard } from '../../common/guards';
import { DebtsService } from './debts.service';
import { CreateDebtDto, RecordDebtPaymentDto, UpdateDebtDto } from './dto';

@ApiTags('Debts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller(ApiRoutes.DEBTS.BASE)
export class DebtsController {
  constructor(private readonly debtsService: DebtsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new debt' })
  @ApiResponse({ status: 201, description: 'Debt created successfully' })
  async create(@GetUser('id') userId: string, @Body() dto: CreateDebtDto) {
    const debt = await this.debtsService.create(userId, dto);
    return {
      success: true,
      data: debt,
      message: 'Debt created successfully',
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all debts' })
  @ApiQuery({ name: 'type', required: false, description: 'Filter by debt type: 1=Lending, 2=Borrowing' })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by status: 1=Active, 2=Paid, 3=Partial, 4=Overdue',
  })
  @ApiResponse({ status: 200, description: 'Debts retrieved successfully' })
  async findAll(@GetUser('id') userId: string, @Query('type') type?: number, @Query('status') status?: number) {
    const debts = await this.debtsService.findAll(userId, type);
    // Filter by status if provided
    const filteredDebts = status ? debts.filter((d) => d.status === status) : debts;

    return {
      success: true,
      data: filteredDebts,
      message: 'Debts retrieved successfully',
    };
  }

  @Get(ApiRoutes.DEBTS.SUMMARY)
  @ApiOperation({ summary: 'Get debt summary statistics' })
  @ApiResponse({ status: 200, description: 'Debt summary retrieved successfully' })
  async getSummary(@GetUser('id') userId: string) {
    const summary = await this.debtsService.getSummary(userId);
    return {
      success: true,
      data: summary,
      message: 'Debt summary retrieved successfully',
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get debt by ID' })
  @ApiResponse({ status: 200, description: 'Debt retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Debt not found' })
  async findOne(@GetUser('id') userId: string, @Param('id') id: string) {
    const debt = await this.debtsService.findOne(userId, id);
    return {
      success: true,
      data: debt,
      message: 'Debt retrieved successfully',
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a debt' })
  @ApiResponse({ status: 200, description: 'Debt updated successfully' })
  @ApiResponse({ status: 404, description: 'Debt not found' })
  async update(@GetUser('id') userId: string, @Param('id') id: string, @Body() dto: UpdateDebtDto) {
    const debt = await this.debtsService.update(userId, id, dto);
    return {
      success: true,
      data: debt,
      message: 'Debt updated successfully',
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a debt' })
  @ApiResponse({ status: 200, description: 'Debt deleted successfully' })
  @ApiResponse({ status: 404, description: 'Debt not found' })
  async remove(@GetUser('id') userId: string, @Param('id') id: string) {
    await this.debtsService.remove(userId, id);
    return {
      success: true,
      data: null,
      message: 'Debt deleted successfully',
    };
  }

  @Post(`:id/${ApiRoutes.DEBTS.PAYMENTS}`)
  @ApiOperation({ summary: 'Record a debt payment' })
  @ApiResponse({ status: 201, description: 'Payment recorded successfully' })
  async recordPayment(@GetUser('id') userId: string, @Param('id') id: string, @Body() dto: RecordDebtPaymentDto) {
    const payment = await this.debtsService.recordPayment(userId, id, dto);
    return {
      success: true,
      data: payment,
      message: 'Payment recorded successfully',
    };
  }

  @Get(`:id/${ApiRoutes.DEBTS.PAYMENTS}`)
  @ApiOperation({ summary: 'Get debt payment history' })
  @ApiResponse({ status: 200, description: 'Payment history retrieved successfully' })
  async getPayments(@GetUser('id') userId: string, @Param('id') id: string) {
    const payments = await this.debtsService.getPayments(userId, id);
    return {
      success: true,
      data: payments,
      message: 'Payment history retrieved successfully',
    };
  }

  @Delete(`:id/${ApiRoutes.DEBTS.DELETE_PAYMENT}`)
  @ApiOperation({ summary: 'Delete a debt payment (within 7 days)' })
  @ApiResponse({ status: 200, description: 'Payment deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete payment older than 7 days' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async deletePayment(
    @GetUser('id') userId: string,
    @Param('id') debtId: string,
    @Param('paymentId') paymentId: string,
  ) {
    await this.debtsService.deletePayment(userId, debtId, paymentId);
    return {
      success: true,
      data: null,
      message: 'Payment deleted successfully',
    };
  }
}
