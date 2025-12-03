import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

/**
 * DTO for recording a loan payment
 * SIMPLIFIED: Only allows paying the scheduled monthly amount (no prepayment option)
 */
export class CreateLoanPaymentDto {
  @ApiProperty({ example: '2024-02-01', description: 'Payment date (YYYY-MM-DD)' })
  @IsDateString()
  @IsNotEmpty()
  paymentDate: string;

  @ApiProperty({ example: 5000000, description: 'Total payment amount (should match monthly payment)' })
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  amount: number;

  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Account ID to deduct payment from',
  })
  @IsOptional()
  @IsString()
  accountId?: string;

  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Category ID for both principal and interest (fallback if specific categories not provided)',
  })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Category ID specifically for principal payment (overrides categoryId)',
  })
  @IsOptional()
  @IsString()
  principalCategoryId?: string;

  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Category ID specifically for interest payment (overrides categoryId)',
  })
  @IsOptional()
  @IsString()
  interestCategoryId?: string;

  @ApiPropertyOptional({ example: 'Paid on time' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

/**
 * DTO for making extra principal payment (outside regular schedule)
 * SIMPLIFIED: Always reduces monthly payment while keeping the term (number of months) unchanged
 */
export class ExtraPrincipalPaymentDto {
  @ApiProperty({ example: 10000000, description: 'Extra principal amount to pay' })
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  amount: number;

  @ApiProperty({ example: '2025-12-02', description: 'Payment date' })
  @IsDateString()
  paymentDate: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Account ID to deduct payment from',
  })
  @IsString()
  @IsNotEmpty()
  accountId: string;

  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Category ID for principal payment',
  })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ example: 'Extra payment to reduce principal' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

/**
 * DTO for simulating prepayment
 */
export class SimulatePrepaymentDto {
  @ApiProperty({ example: 10000000, description: 'Prepayment amount' })
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  prepaymentAmount: number;

  @ApiPropertyOptional({ example: '2025-12-01', description: 'Prepayment date (optional, for simulation)' })
  @IsOptional()
  @IsDateString()
  prepaymentDate?: string;

  @ApiProperty({
    example: 'reduce_term',
    enum: ['reduce_term', 'reduce_payment'],
    description: 'Prepayment strategy',
  })
  @IsString()
  @IsNotEmpty()
  strategy: 'reduce_term' | 'reduce_payment';
}

/**
 * DTO for querying loans
 */
export class QueryLoanDto {
  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({ example: 20, default: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number;

  @ApiPropertyOptional({ description: 'Filter by loan type', enum: [1, 2, 3, 4, 5] })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  type?: number;

  @ApiPropertyOptional({ description: 'Filter by loan status', enum: [1, 2, 3, 4] })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(4)
  @Type(() => Number)
  status?: number;
}

// Export DTOs from separate files
export { CreateLoanDto } from './create-loan.dto';
export { UpdateLoanDto } from './update-loan.dto';
