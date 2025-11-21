import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateRecurringTransactionDto, QueryRecurringTransactionDto, UpdateRecurringTransactionDto } from './dto';
import { RecurringTransactionsService } from './recurring-transactions.service';

/**
 * Controller for recurring transactions management
 */
@ApiTags('Recurring Transactions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('recurring-transactions')
export class RecurringTransactionsController {
  constructor(private readonly recurringTransactionsService: RecurringTransactionsService) {}

  /**
   * Create new recurring transaction
   */
  @Post()
  @ApiOperation({ summary: 'Create recurring transaction' })
  @ApiResponse({ status: 201, description: 'Recurring transaction created successfully' })
  async create(@Request() req, @Body() createDto: CreateRecurringTransactionDto) {
    const data = await this.recurringTransactionsService.create(req.user.userId, createDto);
    return {
      success: true,
      data,
      message: 'Recurring transaction created successfully',
    };
  }

  /**
   * Get all recurring transactions with pagination
   */
  @Get()
  @ApiOperation({ summary: 'Get all recurring transactions' })
  @ApiResponse({ status: 200, description: 'Recurring transactions retrieved successfully' })
  async findAll(@Request() req, @Query() query: QueryRecurringTransactionDto) {
    const data = await this.recurringTransactionsService.findAll(req.user.userId, query);
    return {
      success: true,
      data,
      message: 'Recurring transactions retrieved successfully',
    };
  }

  /**
   * Get due recurring transactions (ready to execute)
   */
  @Get('due')
  @ApiOperation({ summary: 'Get due recurring transactions' })
  @ApiResponse({ status: 200, description: 'Due recurring transactions retrieved' })
  async getDueTransactions(@Request() req) {
    const data = await this.recurringTransactionsService.getDueTransactions(req.user.userId);
    return {
      success: true,
      data,
      message: 'Due recurring transactions retrieved successfully',
    };
  }

  /**
   * Get recurring transaction by ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get recurring transaction by ID' })
  @ApiResponse({ status: 200, description: 'Recurring transaction retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Recurring transaction not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    const data = await this.recurringTransactionsService.findOne(id, req.user.userId);
    return {
      success: true,
      data,
      message: 'Recurring transaction retrieved successfully',
    };
  }

  /**
   * Update recurring transaction
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Update recurring transaction' })
  @ApiResponse({ status: 200, description: 'Recurring transaction updated successfully' })
  @ApiResponse({ status: 404, description: 'Recurring transaction not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
    @Body() updateDto: UpdateRecurringTransactionDto,
  ) {
    const data = await this.recurringTransactionsService.update(id, req.user.userId, updateDto);
    return {
      success: true,
      data,
      message: 'Recurring transaction updated successfully',
    };
  }

  /**
   * Toggle active status
   */
  @Patch(':id/toggle-active')
  @ApiOperation({ summary: 'Toggle recurring transaction active status' })
  @ApiResponse({ status: 200, description: 'Status toggled successfully' })
  async toggleActive(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    const data = await this.recurringTransactionsService.toggleActive(id, req.user.userId);
    return {
      success: true,
      data,
      message: 'Status toggled successfully',
    };
  }

  /**
   * Execute recurring transaction manually
   */
  @Post(':id/execute')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Execute recurring transaction manually' })
  @ApiResponse({ status: 200, description: 'Recurring transaction executed' })
  @ApiResponse({ status: 404, description: 'Recurring transaction not found' })
  async execute(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.recurringTransactionsService.executeRecurringTransaction(id);
    return {
      success: true,
      data,
      message: 'Recurring transaction executed successfully',
    };
  }

  /**
   * Delete recurring transaction
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete recurring transaction' })
  @ApiResponse({ status: 204, description: 'Recurring transaction deleted successfully' })
  @ApiResponse({ status: 404, description: 'Recurring transaction not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    await this.recurringTransactionsService.remove(id, req.user.userId);
  }
}
