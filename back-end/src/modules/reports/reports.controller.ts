import { Controller, Get, ParseIntPipe, Query, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { DateRangeDto } from './dto';
import { ReportsService } from './reports.service';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('income-expense')
  @ApiOperation({
    summary: 'Income vs Expense Report',
    description: 'Báo cáo tổng thu, tổng chi, số dư trong khoảng thời gian',
  })
  @ApiResponse({
    status: 200,
    description: 'Income vs Expense report data',
  })
  async getIncomeExpense(@Request() req, @Query() dateRange: DateRangeDto) {
    const data = await this.reportsService.getIncomeExpenseReport(req.user.userId, dateRange);
    return {
      success: true,
      data,
      message: 'Income expense report retrieved successfully',
    };
  }

  @Get('category-distribution')
  @ApiOperation({
    summary: 'Category Distribution Report',
    description: 'Phân bổ chi tiêu theo danh mục (dữ liệu cho Pie chart)',
  })
  @ApiResponse({
    status: 200,
    description: 'Category distribution data',
  })
  async getCategoryDistribution(@Request() req, @Query() dateRange: DateRangeDto) {
    const data = await this.reportsService.getCategoryDistribution(req.user.userId, dateRange);
    return {
      success: true,
      data,
      message: 'Category distribution retrieved successfully',
    };
  }

  @Get('monthly-trend')
  @ApiOperation({
    summary: 'Monthly Trend Report',
    description: 'Xu hướng thu chi theo tháng trong năm',
  })
  @ApiQuery({
    name: 'year',
    required: true,
    type: Number,
    example: 2024,
  })
  @ApiResponse({
    status: 200,
    description: 'Monthly trend data',
  })
  async getMonthlyTrend(@Request() req, @Query('year', ParseIntPipe) year: number) {
    const data = await this.reportsService.getMonthlyTrend(req.user.userId, year);
    return {
      success: true,
      data,
      message: 'Monthly trend retrieved successfully',
    };
  }

  @Get('account-balance')
  @ApiOperation({
    summary: 'Account Balance History',
    description: 'Lịch sử số dư của các tài khoản',
  })
  @ApiQuery({
    name: 'accountId',
    required: false,
    type: String,
    description: 'Lọc theo tài khoản cụ thể',
  })
  @ApiResponse({
    status: 200,
    description: 'Account balance history',
  })
  async getAccountBalance(@Request() req, @Query('accountId') accountId?: string) {
    const data = await this.reportsService.getAccountBalanceHistory(req.user.userId, accountId);
    return {
      success: true,
      data,
      message: 'Account balance history retrieved successfully',
    };
  }

  @Get('cash-flow')
  @ApiOperation({
    summary: 'Cash Flow Report',
    description: 'Dòng tiền vào/ra theo ngày',
  })
  @ApiResponse({
    status: 200,
    description: 'Cash flow data',
  })
  async getCashFlow(@Request() req, @Query() dateRange: DateRangeDto) {
    const data = await this.reportsService.getCashFlow(req.user.userId, dateRange);
    return {
      success: true,
      data,
      message: 'Cash flow report retrieved successfully',
    };
  }

  @Get('top-spending')
  @ApiOperation({
    summary: 'Top Spending Categories',
    description: 'Top danh mục chi tiêu nhiều nhất',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 10,
    description: 'Số lượng danh mục hiển thị',
  })
  @ApiResponse({
    status: 200,
    description: 'Top spending categories',
  })
  async getTopSpending(
    @Request() req,
    @Query() dateRange: DateRangeDto,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    const data = await this.reportsService.getTopSpendingCategories(req.user.userId, dateRange, limit || 10);
    return {
      success: true,
      data,
      message: 'Top spending categories retrieved successfully',
    };
  }

  @Get('financial-summary')
  @ApiOperation({
    summary: 'Financial Summary',
    description: 'Tổng quan tài chính toàn diện',
  })
  @ApiResponse({
    status: 200,
    description: 'Financial summary data',
  })
  async getFinancialSummary(@Request() req) {
    const data = await this.reportsService.getFinancialSummary(req.user.userId);
    return {
      success: true,
      data,
      message: 'Financial summary retrieved successfully',
    };
  }
}
