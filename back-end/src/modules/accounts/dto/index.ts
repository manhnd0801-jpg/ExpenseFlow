import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class CreateAccountDto {
  @ApiProperty({ description: 'Account name', example: 'Cash Wallet' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'Account type: 1=Cash, 2=Bank, 3=Credit Card, 4=E-Wallet, 5=Investment',
    example: 1,
    enum: [1, 2, 3, 4, 5],
  })
  @IsInt()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  type: number;

  @ApiProperty({ description: 'Initial balance', example: 5000000, required: false })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  balance?: number;

  @ApiProperty({
    description: 'Currency: 1=VND, 2=USD, 3=EUR, 4=JPY, 5=CNY',
    example: 1,
    required: false,
    enum: [1, 2, 3, 4, 5],
  })
  @IsInt()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  @IsOptional()
  currency?: number;

  @ApiProperty({ description: 'Bank name', example: 'Vietcombank', required: false })
  @IsString()
  @MaxLength(255)
  @IsOptional()
  bankName?: string;

  @ApiProperty({ description: 'Account number', example: '1234567890', required: false })
  @IsString()
  @MaxLength(50)
  @IsOptional()
  accountNumber?: string;

  @ApiProperty({ description: 'Description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Color (hex)', example: '#FF6B6B', required: false })
  @IsString()
  @MaxLength(7)
  @IsOptional()
  color?: string;

  @ApiProperty({ description: 'Icon name', example: 'wallet', required: false })
  @IsString()
  @MaxLength(50)
  @IsOptional()
  icon?: string;

  @ApiProperty({ description: 'Is active', example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ description: 'Include in total balance', example: true, required: false })
  @IsBoolean()
  @IsOptional()
  includeInTotal?: boolean;

  @ApiProperty({ description: 'Credit limit (for credit cards)', example: 50000000, required: false })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  creditLimit?: number;

  @ApiProperty({ description: 'Interest rate (%)', example: 0.5, required: false })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  interestRate?: number;
}

export class UpdateAccountDto {
  @IsString()
  @MaxLength(255)
  @IsOptional()
  name?: string;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  balance?: number;

  @IsString()
  @MaxLength(255)
  @IsOptional()
  bankName?: string;

  @IsString()
  @MaxLength(50)
  @IsOptional()
  accountNumber?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @MaxLength(7)
  @IsOptional()
  color?: string;

  @IsString()
  @MaxLength(50)
  @IsOptional()
  icon?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  includeInTotal?: boolean;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  creditLimit?: number;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  interestRate?: number;
}

export * from './account.dto';
