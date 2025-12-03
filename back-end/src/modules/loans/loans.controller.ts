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
import { ApiRoutes } from '../../common/constants';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  CreateLoanDto,
  CreateLoanPaymentDto,
  ExtraPrincipalPaymentDto,
  QueryLoanDto,
  SimulatePrepaymentDto,
  UpdateLoanDto,
} from './dto';
import { LoansService } from './loans.service';

@ApiTags('Loans')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller(ApiRoutes.LOANS.BASE)
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  @Post()
  @ApiOperation({ summary: 'Create new loan' })
  @ApiResponse({ status: 201, description: 'Loan created successfully' })
  async create(@Request() req, @Body() createLoanDto: CreateLoanDto) {
    return this.loansService.create(req.user.id, createLoanDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all loans with pagination' })
  @ApiResponse({ status: 200, description: 'Returns loans list' })
  async findAll(@Request() req, @Query() query: QueryLoanDto) {
    return this.loansService.findAll(req.user.id, query);
  }

  @Get(`:id/${ApiRoutes.LOANS.AMORTIZATION_SCHEDULE}`)
  @ApiOperation({ summary: 'Get loan amortization schedule' })
  @ApiResponse({ status: 200, description: 'Returns amortization schedule' })
  async getAmortizationSchedule(@Request() req, @Param('id', ParseUUIDPipe) id: string) {
    const loan = await this.loansService.findOne(id, req.user.id);
    return this.loansService.generateAmortizationSchedule(loan);
  }

  @Get(`:id/${ApiRoutes.LOANS.PAYMENT_SCHEDULE}`)
  @ApiOperation({ summary: 'Get loan payment schedule with status (paid/unpaid)' })
  @ApiResponse({ status: 200, description: 'Returns payment schedule with payment status for all months' })
  async getPaymentScheduleWithStatus(@Request() req, @Param('id', ParseUUIDPipe) id: string) {
    return this.loansService.getPaymentScheduleWithStatus(id, req.user.id);
  }

  @Get(':id/extra-principal')
  @ApiOperation({ summary: 'Get extra principal payment transactions for a loan' })
  @ApiResponse({ status: 200, description: 'Returns extra principal transactions' })
  async getExtraPrincipalTransactions(@Request() req, @Param('id', ParseUUIDPipe) id: string) {
    return this.loansService.getExtraPrincipalTransactions(id, req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get loan by ID' })
  @ApiResponse({ status: 200, description: 'Returns loan details' })
  async findOne(@Request() req, @Param('id', ParseUUIDPipe) id: string) {
    return this.loansService.findOne(id, req.user.id);
  }

  @Post(`:id/${ApiRoutes.LOANS.SIMULATE_PREPAYMENT}`)
  @ApiOperation({ summary: 'Simulate prepayment impact' })
  @ApiResponse({ status: 200, description: 'Returns prepayment simulation' })
  async simulatePrepayment(@Request() req, @Param('id', ParseUUIDPipe) id: string, @Body() dto: SimulatePrepaymentDto) {
    const loan = await this.loansService.findOne(id, req.user.id);
    return this.loansService.simulatePrepayment(loan, dto);
  }

  @Post(':id/extra-principal')
  @ApiOperation({ summary: 'Make extra principal payment (outside regular schedule)' })
  @ApiResponse({ status: 201, description: 'Extra principal payment successful' })
  async makeExtraPrincipalPayment(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ExtraPrincipalPaymentDto,
  ) {
    return this.loansService.makeExtraPrincipalPayment(id, req.user.id, dto);
  }

  @Delete(':id/extra-principal/:transactionId')
  @ApiOperation({ summary: 'Delete extra principal payment transaction' })
  @ApiResponse({ status: 200, description: 'Extra principal transaction deleted and loan updated' })
  async deleteExtraPrincipalTransaction(
    @Request() req,
    @Param('id', ParseUUIDPipe) loanId: string,
    @Param('transactionId', ParseUUIDPipe) transactionId: string,
  ) {
    return this.loansService.deleteExtraPrincipalTransaction(loanId, transactionId, req.user.id);
  }

  @Post(`:id/${ApiRoutes.LOANS.PAYMENTS}`)
  @ApiOperation({ summary: 'Record loan payment' })
  @ApiResponse({ status: 201, description: 'Payment recorded successfully' })
  async recordPayment(@Request() req, @Param('id', ParseUUIDPipe) id: string, @Body() dto: CreateLoanPaymentDto) {
    return this.loansService.recordPayment(id, req.user.id, dto);
  }

  @Delete(`:id/${ApiRoutes.LOANS.PAYMENTS}/:paymentId`)
  @ApiOperation({ summary: 'Delete loan payment (most recent only)' })
  @ApiResponse({ status: 200, description: 'Payment deleted successfully' })
  @ApiResponse({ status: 400, description: 'Can only delete most recent payment' })
  async deletePayment(
    @Request() req,
    @Param('id', ParseUUIDPipe) loanId: string,
    @Param('paymentId', ParseUUIDPipe) paymentId: string,
  ) {
    await this.loansService.deletePayment(loanId, paymentId, req.user.id);
    return { success: true, message: 'Payment deleted successfully' };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update loan' })
  @ApiResponse({ status: 200, description: 'Loan updated successfully' })
  async update(@Request() req, @Param('id', ParseUUIDPipe) id: string, @Body() updateLoanDto: UpdateLoanDto) {
    return this.loansService.update(id, req.user.id, updateLoanDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete loan' })
  @ApiResponse({ status: 200, description: 'Loan deleted successfully' })
  async remove(@Request() req, @Param('id', ParseUUIDPipe) id: string) {
    await this.loansService.remove(id, req.user.id);
    return null; // Successful deletion
  }
}
