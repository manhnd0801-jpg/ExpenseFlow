import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetUser } from '../../common/decorators';
import { JwtAuthGuard } from '../../common/guards';
import { AccountsService } from './accounts.service';
import { CreateAccountDto, UpdateAccountDto } from './dto';

@ApiTags('Accounts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new account' })
  async create(@GetUser('id') userId: string, @Body() dto: CreateAccountDto) {
    const data = await this.accountsService.create(userId, dto);
    return { success: true, data, message: 'Account created successfully' };
  }

  @Get()
  @ApiOperation({ summary: 'Get all accounts' })
  async findAll(@GetUser('id') userId: string) {
    const data = await this.accountsService.findAll(userId);
    return { success: true, data };
  }

  @Get('total-balance')
  @ApiOperation({ summary: 'Get total balance across all accounts' })
  async getTotalBalance(@GetUser('id') userId: string) {
    const totalBalance = await this.accountsService.getTotalBalance(userId);
    return { success: true, data: { totalBalance } };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get account by ID' })
  async findOne(@GetUser('id') userId: string, @Param('id') id: string) {
    const data = await this.accountsService.findOne(userId, id);
    return { success: true, data };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an account' })
  async update(@GetUser('id') userId: string, @Param('id') id: string, @Body() dto: UpdateAccountDto) {
    const data = await this.accountsService.update(userId, id, dto);
    return { success: true, data, message: 'Account updated successfully' };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an account' })
  async remove(@GetUser('id') userId: string, @Param('id') id: string) {
    await this.accountsService.remove(userId, id);
    return { success: true, message: 'Account deleted successfully' };
  }
}
