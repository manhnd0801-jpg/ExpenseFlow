import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, Max, Min } from 'class-validator';

/**
 * DTO for querying recurring transactions
 */
export class QueryRecurringTransactionDto {
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

  @ApiPropertyOptional({ description: 'Filter by type', enum: [1, 2] })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(2)
  @Type(() => Number)
  type?: number;

  @ApiPropertyOptional({ description: 'Filter by active status' })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean;
}

export { CreateRecurringTransactionDto } from './create-recurring-transaction.dto';
export { UpdateRecurringTransactionDto } from './update-recurring-transaction.dto';
