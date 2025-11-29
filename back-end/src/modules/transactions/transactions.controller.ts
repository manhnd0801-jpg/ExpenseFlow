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
import { ApiRoutes } from '../../common/constants';
import { GetUser } from '../../common/decorators';
import {
  apiPaginatedResponseSchema,
  apiResponseSchema,
  createPaginatedResponse,
  PaginatedResponseDto,
} from '../../common/dto';
import { JwtAuthGuard } from '../../common/guards';
import { CreateTransactionDto, QueryTransactionDto, TransactionResponseDto, UpdateTransactionDto } from './dto';
import { TransactionsService } from './transactions.service';

@ApiTags('Transactions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller(ApiRoutes.TRANSACTIONS.BASE)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new transaction' })
  @ApiResponse({
    status: 201,
    description: 'Transaction created successfully',
    ...apiResponseSchema(TransactionResponseDto),
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Account or Category not found' })
  async create(
    @GetUser('id') userId: string,
    @Body() createTransactionDto: CreateTransactionDto,
  ): Promise<TransactionResponseDto> {
    const transaction = await this.transactionsService.create(userId, createTransactionDto);

    return plainToInstance(TransactionResponseDto, transaction, {
      excludeExtraneousValues: false,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get all transactions with filters and pagination' })
  @ApiResponse({
    status: 200,
    description: 'Transactions retrieved successfully',
    ...apiPaginatedResponseSchema(TransactionResponseDto),
  })
  async findAll(
    @GetUser('id') userId: string,
    @Query() queryDto: QueryTransactionDto,
  ): Promise<PaginatedResponseDto<TransactionResponseDto>> {
    const { data, total } = await this.transactionsService.findAll(userId, queryDto);

    const { page = 1, limit = 20 } = queryDto;

    return createPaginatedResponse(
      plainToInstance(TransactionResponseDto, data, {
        excludeExtraneousValues: false,
      }) as any,
      total,
      page,
      limit,
    );
  }

  @Get(ApiRoutes.TRANSACTIONS.SUMMARY)
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
  ): Promise<any> {
    return await this.transactionsService.getSummary(userId, startDate, endDate, accountId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get transaction by ID' })
  @ApiResponse({
    status: 200,
    description: 'Transaction retrieved successfully',
    ...apiResponseSchema(TransactionResponseDto),
  })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async findOne(@GetUser('id') userId: string, @Param('id') id: string): Promise<TransactionResponseDto> {
    const transaction = await this.transactionsService.findOne(userId, id);

    return plainToInstance(TransactionResponseDto, transaction, {
      excludeExtraneousValues: false,
    });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a transaction' })
  @ApiResponse({
    status: 200,
    description: 'Transaction updated successfully',
    ...apiResponseSchema(TransactionResponseDto),
  })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async update(
    @GetUser('id') userId: string,
    @Param('id') id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
  ): Promise<TransactionResponseDto> {
    const transaction = await this.transactionsService.update(userId, id, updateTransactionDto);

    return plainToInstance(TransactionResponseDto, transaction, {
      excludeExtraneousValues: false,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a transaction' })
  @ApiResponse({
    status: 204,
    description: 'Transaction deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async remove(@GetUser('id') userId: string, @Param('id') id: string): Promise<void> {
    await this.transactionsService.remove(userId, id);
  }
}
