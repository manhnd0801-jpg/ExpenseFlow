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
  @ApiProperty({ example: 'uuid', description: 'Budget ID' })
  id: string;

  @ApiProperty({ example: 'uuid', description: 'User ID' })
  userId: string;

  @ApiProperty({ example: 'uuid', description: 'Category ID (null for overall budget)', required: false })
  categoryId?: string;

  @ApiProperty({ example: 'Monthly Food Budget', description: 'Budget name' })
  name: string;

  @ApiProperty({ example: 5000000, description: 'Budget limit amount' })
  amount: number;

  @ApiProperty({ example: 3500000, description: 'Amount spent' })
  spent: number;

  @ApiProperty({ example: 1500000, description: 'Remaining amount' })
  remaining: number;

  @ApiProperty({ example: 70, description: 'Percentage spent' })
  percentage: number;

  @ApiProperty({
    example: 3,
    description: 'Budget period: 1=Daily, 2=Weekly, 3=Monthly, 4=Quarterly, 5=Yearly, 6=Custom',
  })
  period: number;

  @ApiProperty({ example: '2025-01-01', description: 'Start date' })
  startDate: Date;

  @ApiProperty({ example: '2025-01-31', description: 'End date', required: false })
  endDate?: Date;

  @ApiProperty({ example: 80, description: 'Alert threshold percentage', required: false })
  alertThreshold?: number;

  @ApiProperty({ description: 'Category details', required: false })
  category?: any;

  @ApiProperty({ example: '2025-11-29T08:00:00Z', description: 'Created date' })
  createdAt: Date;

  @ApiProperty({ example: '2025-11-29T08:00:00Z', description: 'Updated date' })
  updatedAt: Date;
}
