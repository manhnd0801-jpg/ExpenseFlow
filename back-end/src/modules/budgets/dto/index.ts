import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateBudgetDto {
  @ApiProperty({ description: 'Budget name', example: 'Monthly Food Budget' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({ description: 'Category ID (optional for total budget)', required: false })
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @ApiProperty({ description: 'Budget amount', example: 5000000 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  amount: number;

  @ApiProperty({
    description: 'Budget period: 1=Daily, 2=Weekly, 3=Monthly, 4=Quarterly, 5=Yearly, 6=Custom',
    example: 3,
    enum: [1, 2, 3, 4, 5, 6],
  })
  @IsInt()
  @Min(1)
  @Max(6)
  @Type(() => Number)
  period: number;

  @ApiProperty({ description: 'Start date', example: '2025-01-01' })
  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @ApiProperty({ description: 'End date (required for custom period)', example: '2025-01-31', required: false })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  endDate?: Date;

  @ApiProperty({ description: 'Alert threshold percentage', example: 80, required: false })
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  @IsOptional()
  alertThreshold?: number;
}

export class UpdateBudgetDto {
  @IsString()
  @MaxLength(255)
  @IsOptional()
  name?: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  amount?: number;

  @IsInt()
  @Min(1)
  @Max(6)
  @Type(() => Number)
  @IsOptional()
  period?: number;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  startDate?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  endDate?: Date;

  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  @IsOptional()
  alertThreshold?: number;
}

export class BudgetResponseDto {
  id: string;
  userId: string;
  categoryId?: string;
  name: string;
  amount: number;
  spent: number;
  remaining: number;
  percentage: number;
  period: number;
  startDate: Date;
  endDate?: Date;
  alertThreshold?: number;
  category?: any;
  createdAt: Date;
  updatedAt: Date;
}
