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

/**
 * DTO for creating a transaction
 * CRITICAL: type field uses INTEGER (1=Income, 2=Expense, 3=Transfer)
 */
export class CreateTransactionDto {
  @ApiProperty({
    description: 'Account ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  accountId: string;

  @ApiProperty({
    description: 'Category ID (optional for transfers)',
    example: '550e8400-e29b-41d4-a716-446655440001',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @ApiProperty({
    description: 'Transaction type: 1=Income, 2=Expense, 3=Transfer',
    example: 2,
    enum: [1, 2, 3],
  })
  @IsInt()
  @Min(1)
  @Max(3)
  @Type(() => Number)
  type: number;

  @ApiProperty({
    description: 'Transaction amount (positive number)',
    example: 50000,
  })
  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  amount: number;

  @ApiProperty({
    description: 'Transaction date (YYYY-MM-DD)',
    example: '2025-01-15',
  })
  @IsDate()
  @Type(() => Date)
  date: Date;

  @ApiProperty({
    description: 'Transaction description',
    example: 'Lunch with colleagues',
    maxLength: 500,
    required: false,
  })
  @IsString()
  @MaxLength(500)
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Additional note',
    example: 'Business expense',
    required: false,
  })
  @IsString()
  @IsOptional()
  note?: string;

  @ApiProperty({
    description: 'Receipt image URL',
    example: 'https://example.com/receipts/12345.jpg',
    required: false,
  })
  @IsString()
  @IsOptional()
  receiptImage?: string;

  @ApiProperty({
    description: 'Transaction location',
    example: 'Restaurant ABC, Hanoi',
    maxLength: 255,
    required: false,
  })
  @IsString()
  @MaxLength(255)
  @IsOptional()
  location?: string;

  @ApiProperty({
    description: 'Reference number',
    example: 'REF-2025-001',
    maxLength: 100,
    required: false,
  })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  reference?: string;

  @ApiProperty({
    description: 'Tags (array of strings)',
    example: ['food', 'work'],
    required: false,
    type: [String],
  })
  @IsOptional()
  tags?: string[];

  @ApiProperty({
    description: 'Event ID (if transaction is linked to an event)',
    example: '550e8400-e29b-41d4-a716-446655440002',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  eventId?: string;

  @ApiProperty({
    description: 'To Account ID (required for transfer transactions)',
    example: '550e8400-e29b-41d4-a716-446655440003',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  toAccountId?: string;
}
