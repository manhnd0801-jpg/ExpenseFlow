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
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

/**
 * DTO for creating recurring transaction
 */
export class CreateRecurringTransactionDto {
  @ApiProperty({ example: 'Monthly Salary', maxLength: 255 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ example: 'Fixed monthly income' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 5000000, description: 'Transaction amount' })
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  amount: number;

  @ApiProperty({
    description: 'Transaction type',
    enum: [1, 2],
    example: 1,
    type: 'integer',
  })
  @IsInt()
  @Min(1)
  @Max(2)
  @Type(() => Number)
  type: number; // 1=Income, 2=Expense

  @ApiProperty({
    description: 'Frequency type',
    enum: [2, 3, 4, 5, 6],
    example: 4,
    type: 'integer',
  })
  @IsInt()
  @Min(2)
  @Max(6)
  @Type(() => Number)
  frequency: number; // 2=Daily, 3=Weekly, 4=Monthly, 5=Quarterly, 6=Yearly

  @ApiPropertyOptional({ example: 'uuid', description: 'Category ID' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiProperty({ example: '2024-01-01', description: 'Start date (YYYY-MM-DD)' })
  @IsDateString()
  startDate: string;

  @ApiPropertyOptional({ example: '2024-12-31', description: 'End date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
