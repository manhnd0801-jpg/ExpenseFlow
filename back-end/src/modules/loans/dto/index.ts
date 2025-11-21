import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
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
 */
export class CreateLoanPaymentDto {
  @ApiProperty({ example: '2024-02-01', description: 'Payment date (YYYY-MM-DD)' })
  @IsDateString()
  @IsNotEmpty()
  paymentDate: string;

  @ApiProperty({ example: 5000000, description: 'Total payment amount' })
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  amount: number;

  @ApiPropertyOptional({
    example: 1000000,
    description: 'Extra payment towards principal (prepayment)',
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  prepaymentAmount?: number;

  @ApiPropertyOptional({ example: 'Paid on time' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;

  @ApiPropertyOptional({
    example: true,
    default: false,
    description: 'Whether this is a prepayment (extra payment)',
  })
  @IsOptional()
  @IsBoolean()
  isPrepayment?: boolean;
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
