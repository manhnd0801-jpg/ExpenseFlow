import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { ApiRoutes } from '../../common/constants';
import { GetUser } from '../../common/decorators';
import { apiResponseSchema } from '../../common/dto';
import { JwtAuthGuard } from '../../common/guards';
import { AccountsService } from './accounts.service';
import { AccountResponseDto, CreateAccountDto, TransferDto, UpdateAccountDto } from './dto';

@ApiTags('Accounts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller(ApiRoutes.ACCOUNTS.BASE)
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new account' })
  @ApiResponse({
    status: 201,
    description: 'Account created successfully',
    ...apiResponseSchema(AccountResponseDto),
  })
  async create(@GetUser('id') userId: string, @Body() dto: CreateAccountDto): Promise<AccountResponseDto> {
    const account = await this.accountsService.create(userId, dto);
    return plainToInstance(AccountResponseDto, account, {
      excludeExtraneousValues: false,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get all accounts' })
  @ApiResponse({
    status: 200,
    description: 'Accounts retrieved successfully',
    type: [AccountResponseDto],
  })
  async findAll(@GetUser('id') userId: string): Promise<AccountResponseDto[]> {
    const accounts = await this.accountsService.findAll(userId);
    return plainToInstance(AccountResponseDto, accounts, {
      excludeExtraneousValues: false,
    }) as any;
  }

  @Get(ApiRoutes.ACCOUNTS.TOTAL_BALANCE)
  @ApiOperation({ summary: 'Get total balance across all accounts' })
  @ApiResponse({
    status: 200,
    description: 'Total balance retrieved successfully',
  })
  async getTotalBalance(@GetUser('id') userId: string): Promise<{ totalBalance: number }> {
    const totalBalance = await this.accountsService.getTotalBalance(userId);
    return { totalBalance };
  }

  @Post(':id/transfer')
  @ApiOperation({ summary: 'Transfer money between accounts' })
  @ApiResponse({
    status: 200,
    description: 'Transfer completed successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid transfer request' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  async transfer(
    @GetUser('id') userId: string,
    @Param('id') fromAccountId: string,
    @Body() dto: TransferDto,
  ): Promise<{ success: boolean; message: string }> {
    await this.accountsService.transfer(userId, fromAccountId, dto);
    return { success: true, message: 'Transfer completed successfully' };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get account by ID' })
  @ApiResponse({
    status: 200,
    description: 'Account retrieved successfully',
    ...apiResponseSchema(AccountResponseDto),
  })
  @ApiResponse({ status: 404, description: 'Account not found' })
  async findOne(@GetUser('id') userId: string, @Param('id') id: string): Promise<AccountResponseDto> {
    const account = await this.accountsService.findOne(userId, id);
    return plainToInstance(AccountResponseDto, account, {
      excludeExtraneousValues: false,
    });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an account' })
  @ApiResponse({
    status: 200,
    description: 'Account updated successfully',
    ...apiResponseSchema(AccountResponseDto),
  })
  @ApiResponse({ status: 404, description: 'Account not found' })
  async update(
    @GetUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateAccountDto,
  ): Promise<AccountResponseDto> {
    const account = await this.accountsService.update(userId, id, dto);
    return plainToInstance(AccountResponseDto, account, {
      excludeExtraneousValues: false,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an account' })
  @ApiResponse({
    status: 204,
    description: 'Account deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Account not found' })
  async remove(@GetUser('id') userId: string, @Param('id') id: string): Promise<void> {
    await this.accountsService.remove(userId, id);
  }
}
