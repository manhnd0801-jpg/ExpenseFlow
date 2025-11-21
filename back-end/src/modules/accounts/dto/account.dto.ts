import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateAccountDto {
  @ApiProperty({
    example: 'My Savings Account',
    description: 'Account name',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 2,
    description: 'Account type (1=Cash, 2=Bank, 3=Credit Card, 4=E-Wallet, 5=Investment)',
    minimum: 1,
    maximum: 5,
  })
  @Type(() => Number)
  @IsInt({ message: 'Account type must be an integer' })
  @Min(1, { message: 'Invalid account type' })
  @Max(5, { message: 'Invalid account type' })
  type: number;

  @ApiProperty({
    example: 1000000.5,
    description: 'Initial balance',
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @Transform(({ value }) => parseFloat(value))
  balance?: number;

  @ApiProperty({
    example: 1,
    description: 'Currency (1=VND, 2=USD, 3=EUR, 4=JPY, 5=CNY)',
    required: false,
    minimum: 1,
    maximum: 5,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Currency must be an integer' })
  @Min(1, { message: 'Invalid currency' })
  @Max(5, { message: 'Invalid currency' })
  currency?: number;

  @ApiProperty({
    example: 'Vietcombank',
    description: 'Bank name (for bank accounts)',
    required: false,
  })
  @IsOptional()
  @IsString()
  bankName?: string;

  @ApiProperty({
    example: '1234567890',
    description: 'Account number',
    required: false,
  })
  @IsOptional()
  @IsString()
  accountNumber?: string;

  @ApiProperty({
    example: 'My main savings account',
    description: 'Account description',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: '#4CAF50',
    description: 'Color for UI (hex format)',
    required: false,
  })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiProperty({
    example: 'credit-card',
    description: 'Icon name for UI',
    required: false,
  })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({
    example: true,
    description: 'Include in total balance calculation',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  includeInTotal?: boolean;

  @ApiProperty({
    example: 50000000,
    description: 'Credit limit (for credit cards)',
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @Transform(({ value }) => parseFloat(value))
  creditLimit?: number;

  @ApiProperty({
    example: 12.5,
    description: 'Annual interest rate percentage',
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @Transform(({ value }) => parseFloat(value))
  interestRate?: number;
}

export class UpdateAccountDto {
  @ApiProperty({
    example: 'Updated Account Name',
    description: 'Account name',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    example: 2,
    description: 'Account type (1=Cash, 2=Bank, 3=Credit Card, 4=E-Wallet, 5=Investment)',
    required: false,
    minimum: 1,
    maximum: 5,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Account type must be an integer' })
  @Min(1, { message: 'Invalid account type' })
  @Max(5, { message: 'Invalid account type' })
  type?: number;

  @ApiProperty({
    example: 1,
    description: 'Currency (1=VND, 2=USD, 3=EUR, 4=JPY, 5=CNY)',
    required: false,
    minimum: 1,
    maximum: 5,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Currency must be an integer' })
  @Min(1, { message: 'Invalid currency' })
  @Max(5, { message: 'Invalid currency' })
  currency?: number;

  @ApiProperty({
    example: 'Updated Bank',
    description: 'Bank name',
    required: false,
  })
  @IsOptional()
  @IsString()
  bankName?: string;

  @ApiProperty({
    example: '9876543210',
    description: 'Account number',
    required: false,
  })
  @IsOptional()
  @IsString()
  accountNumber?: string;

  @ApiProperty({
    example: 'Updated description',
    description: 'Account description',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: '#FF5722',
    description: 'Color for UI',
    required: false,
  })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiProperty({
    example: 'bank',
    description: 'Icon name for UI',
    required: false,
  })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({
    example: true,
    description: 'Whether account is active',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    example: false,
    description: 'Include in total balance calculation',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  includeInTotal?: boolean;

  @ApiProperty({
    example: 75000000,
    description: 'Credit limit (for credit cards)',
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @Transform(({ value }) => parseFloat(value))
  creditLimit?: number;

  @ApiProperty({
    example: 15.0,
    description: 'Annual interest rate percentage',
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @Transform(({ value }) => parseFloat(value))
  interestRate?: number;
}

export class TransferDto {
  @ApiProperty({
    example: 'uuid-of-target-account',
    description: 'Target account ID',
  })
  @IsString()
  toAccountId: string;

  @ApiProperty({
    example: 500000,
    description: 'Transfer amount',
  })
  @Type(() => Number)
  @Transform(({ value }) => parseFloat(value))
  amount: number;

  @ApiProperty({
    example: 'Transfer to savings',
    description: 'Transfer description',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}
