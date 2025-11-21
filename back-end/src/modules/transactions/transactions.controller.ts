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
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { GetUser } from '../../common/decorators';
import { JwtAuthGuard } from '../../common/guards';
import {
  CreateTransactionDto,
  PaginatedTransactionResponseDto,
  QueryTransactionDto,
  TransactionResponseDto,
  UpdateTransactionDto,
} from './dto';
import { TransactionsService } from './transactions.service';

@ApiTags('Transactions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new transaction' })
  @ApiResponse({
    status: 201,
    description: 'Transaction created successfully',
    type: TransactionResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Account or Category not found' })
  async create(
    @GetUser('id') userId: string,
    @Body() createTransactionDto: CreateTransactionDto,
  ): Promise<{ success: boolean; data: TransactionResponseDto; message: string }> {
    const transaction = await this.transactionsService.create(userId, createTransactionDto);

    return {
      success: true,
      data: plainToInstance(TransactionResponseDto, transaction, {
        excludeExtraneousValues: true,
      }),
      message: 'Transaction created successfully',
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all transactions with filters and pagination' })
  @ApiResponse({
    status: 200,
    description: 'Transactions retrieved successfully',
    type: PaginatedTransactionResponseDto,
  })
  async findAll(
    @GetUser('id') userId: string,
    @Query() queryDto: QueryTransactionDto,
  ): Promise<{ success: boolean; data: TransactionResponseDto[]; pagination: any }> {
    const { data, total } = await this.transactionsService.findAll(userId, queryDto);

    const { page = 1, limit = 20 } = queryDto;

    return {
      success: true,
      data: plainToInstance(TransactionResponseDto, data, {
        excludeExtraneousValues: true,
      }),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get transaction summary for a period' })
  @ApiResponse({
    status: 200,
    description: 'Transaction summary retrieved successfully',
  })
  async getSummary(
    @GetUser('id') userId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('accountId') accountId?: string,
  ): Promise<{ success: boolean; data: any }> {
    const summary = await this.transactionsService.getSummary(userId, startDate, endDate, accountId);

    return {
      success: true,
      data: summary,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get transaction by ID' })
  @ApiResponse({
    status: 200,
    description: 'Transaction retrieved successfully',
    type: TransactionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async findOne(
    @GetUser('id') userId: string,
    @Param('id') id: string,
  ): Promise<{ success: boolean; data: TransactionResponseDto }> {
    const transaction = await this.transactionsService.findOne(userId, id);

    return {
      success: true,
      data: plainToInstance(TransactionResponseDto, transaction, {
        excludeExtraneousValues: true,
      }),
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a transaction' })
  @ApiResponse({
    status: 200,
    description: 'Transaction updated successfully',
    type: TransactionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async update(
    @GetUser('id') userId: string,
    @Param('id') id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
  ): Promise<{ success: boolean; data: TransactionResponseDto; message: string }> {
    const transaction = await this.transactionsService.update(userId, id, updateTransactionDto);

    return {
      success: true,
      data: plainToInstance(TransactionResponseDto, transaction, {
        excludeExtraneousValues: true,
      }),
      message: 'Transaction updated successfully',
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a transaction' })
  @ApiResponse({
    status: 200,
    description: 'Transaction deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async remove(@GetUser('id') userId: string, @Param('id') id: string): Promise<{ success: boolean; message: string }> {
    await this.transactionsService.remove(userId, id);

    return {
      success: true,
      message: 'Transaction deleted successfully',
    };
  }
}
