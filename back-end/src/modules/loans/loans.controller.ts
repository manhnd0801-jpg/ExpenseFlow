import {
  Body,
  Controller,
  Delete,
  Get,
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
import { CreateLoanDto, CreateLoanPaymentDto, QueryLoanDto, SimulatePrepaymentDto, UpdateLoanDto } from './dto';
import { LoansService } from './loans.service';

@ApiTags('Loans')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('loans')
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  @Post()
  @ApiOperation({ summary: 'Create new loan' })
  @ApiResponse({ status: 201, description: 'Loan created successfully' })
  async create(@Request() req, @Body() createLoanDto: CreateLoanDto) {
    const loan = await this.loansService.create(req.user.userId, createLoanDto);
    return {
      success: true,
      data: loan,
      message: 'Loan created successfully',
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all loans with pagination' })
  @ApiResponse({ status: 200, description: 'Returns loans list' })
  async findAll(@Request() req, @Query() query: QueryLoanDto) {
    const result = await this.loansService.findAll(req.user.userId, query);
    return {
      success: true,
      data: result.items,
      meta: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
      message: 'Loans retrieved successfully',
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get loan by ID' })
  @ApiResponse({ status: 200, description: 'Returns loan details' })
  async findOne(@Request() req, @Param('id', ParseUUIDPipe) id: string) {
    const loan = await this.loansService.findOne(id, req.user.userId);
    return {
      success: true,
      data: loan,
      message: 'Loan retrieved successfully',
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update loan' })
  @ApiResponse({ status: 200, description: 'Loan updated successfully' })
  async update(@Request() req, @Param('id', ParseUUIDPipe) id: string, @Body() updateLoanDto: UpdateLoanDto) {
    const loan = await this.loansService.update(id, req.user.userId, updateLoanDto);
    return {
      success: true,
      data: loan,
      message: 'Loan updated successfully',
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete loan' })
  @ApiResponse({ status: 200, description: 'Loan deleted successfully' })
  async remove(@Request() req, @Param('id', ParseUUIDPipe) id: string) {
    await this.loansService.remove(id, req.user.userId);
    return {
      success: true,
      data: null,
      message: 'Loan deleted successfully',
    };
  }

  @Get(':id/amortization-schedule')
  @ApiOperation({ summary: 'Get loan amortization schedule' })
  @ApiResponse({ status: 200, description: 'Returns amortization schedule' })
  async getAmortizationSchedule(@Request() req, @Param('id', ParseUUIDPipe) id: string) {
    const loan = await this.loansService.findOne(id, req.user.userId);
    const schedule = this.loansService.generateAmortizationSchedule(loan);
    return {
      success: true,
      data: schedule,
      message: 'Amortization schedule generated successfully',
    };
  }

  @Post(':id/simulate-prepayment')
  @ApiOperation({ summary: 'Simulate prepayment impact' })
  @ApiResponse({ status: 200, description: 'Returns prepayment simulation' })
  async simulatePrepayment(@Request() req, @Param('id', ParseUUIDPipe) id: string, @Body() dto: SimulatePrepaymentDto) {
    const loan = await this.loansService.findOne(id, req.user.userId);
    const simulation = this.loansService.simulatePrepayment(loan, dto);
    return {
      success: true,
      data: simulation,
      message: 'Prepayment simulation completed',
    };
  }

  @Post(':id/payments')
  @ApiOperation({ summary: 'Record loan payment' })
  @ApiResponse({ status: 201, description: 'Payment recorded successfully' })
  async recordPayment(@Request() req, @Param('id', ParseUUIDPipe) id: string, @Body() dto: CreateLoanPaymentDto) {
    const payment = await this.loansService.recordPayment(id, req.user.userId, dto);
    return {
      success: true,
      data: payment,
      message: 'Payment recorded successfully',
    };
  }

  @Get(':id/payments')
  @ApiOperation({ summary: 'Get loan payments history' })
  @ApiResponse({ status: 200, description: 'Returns payment history' })
  async getPayments(@Request() req, @Param('id', ParseUUIDPipe) id: string) {
    const payments = await this.loansService.getPayments(id, req.user.userId);
    return {
      success: true,
      data: payments,
      message: 'Payment history retrieved successfully',
    };
  }
}
