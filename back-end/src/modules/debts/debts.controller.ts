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
    return await this.debtsService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all debts' })
  @ApiResponse({ status: 200, description: 'Debts retrieved successfully' })
  async findAll(@GetUser('id') userId: string, @Query('type') type?: number) {
    return await this.debtsService.findAll(userId, type);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get debt by ID' })
  @ApiResponse({ status: 200, description: 'Debt retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Debt not found' })
  async findOne(@GetUser('id') userId: string, @Param('id') id: string) {
    return await this.debtsService.findOne(userId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a debt' })
  @ApiResponse({ status: 200, description: 'Debt updated successfully' })
  @ApiResponse({ status: 404, description: 'Debt not found' })
  async update(@GetUser('id') userId: string, @Param('id') id: string, @Body() dto: UpdateDebtDto) {
    return await this.debtsService.update(userId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a debt' })
  @ApiResponse({ status: 204, description: 'Debt deleted successfully' })
  @ApiResponse({ status: 404, description: 'Debt not found' })
  async remove(@GetUser('id') userId: string, @Param('id') id: string): Promise<void> {
    await this.debtsService.remove(userId, id);
  }

  @Post(`:id/${ApiRoutes.DEBTS.PAYMENTS}`)
  @ApiOperation({ summary: 'Record a debt payment' })
  @ApiResponse({ status: 200, description: 'Payment recorded successfully' })
  async recordPayment(@GetUser('id') userId: string, @Param('id') id: string, @Body() dto: RecordDebtPaymentDto) {
    return await this.debtsService.recordPayment(userId, id, dto);
  }

  @Get(`:id/${ApiRoutes.DEBTS.PAYMENTS}`)
  @ApiOperation({ summary: 'Get debt payment history' })
  @ApiResponse({ status: 200, description: 'Payment history retrieved successfully' })
  async getPayments(@GetUser('id') userId: string, @Param('id') id: string) {
    return await this.debtsService.getPayments(userId, id);
  }
}
