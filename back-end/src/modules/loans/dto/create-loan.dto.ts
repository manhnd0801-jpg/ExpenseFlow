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
 * DTO for creating a new loan
 */
export class CreateLoanDto {
  @ApiProperty({
    description: 'Loan type',
    enum: [1, 2, 3, 4, 5],
    example: 2,
    type: 'integer',
  })
  @IsInt()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  type: number; // LoanType enum

  @ApiProperty({ example: 'Home Mortgage', maxLength: 255 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ example: 'Vietcombank', maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  lender?: string;

  @ApiProperty({ example: 500000000, description: 'Total loan amount in VND' })
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  originalAmount: number;

  @ApiProperty({ example: 12.5, description: 'Annual interest rate percentage' })
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  interestRate: number;

  @ApiProperty({ example: 240, description: 'Loan term in months' })
  @IsInt()
  @Min(1)
  @Max(600)
  @Type(() => Number)
  termMonths: number;

  @ApiProperty({ example: '2024-01-01', description: 'Loan start date (YYYY-MM-DD)' })
  @IsDateString()
  startDate: string;

  @ApiPropertyOptional({ example: 'Home loan for new apartment' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'Remember to pay on time' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  reminderEnabled?: boolean;

  @ApiPropertyOptional({ example: 3, default: 3, description: 'Days before payment due' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(30)
  @Type(() => Number)
  reminderDaysBefore?: number;
}
