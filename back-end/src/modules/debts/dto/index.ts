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
  ValidateBy,
  ValidationOptions,
} from 'class-validator';

// Custom validator to ensure principal + interest = amount
export function IsValidPaymentBreakdown(validationOptions?: ValidationOptions) {
  return ValidateBy(
    {
      name: 'isValidPaymentBreakdown',
      validator: {
        validate: (value: any, args: any) => {
          const obj = args?.object as RecordDebtPaymentDto;
          if (
            !obj ||
            typeof obj.amount !== 'number' ||
            typeof obj.principalAmount !== 'number' ||
            typeof obj.interestAmount !== 'number'
          ) {
            return false;
          }
          const totalCalculated = obj.principalAmount + obj.interestAmount;
          // Allow small floating point differences
          return Math.abs(obj.amount - totalCalculated) < 0.01;
        },
        defaultMessage: () => 'Principal amount + Interest amount must equal total amount',
      },
    },
    validationOptions,
  );
}

export class CreateDebtDto {
  @ApiProperty({ description: 'Debt type: 1=Lending, 2=Borrowing', example: 1, enum: [1, 2] })
  @IsInt()
  @Min(1)
  @Max(2)
  @Type(() => Number)
  type: number;

  @ApiProperty({
    description: 'Account ID for debt transactions',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  accountId?: string;

  @ApiProperty({
    description: 'Category ID for debt transactions',
    example: '550e8400-e29b-41d4-a716-446655440001',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @ApiProperty({ description: 'Person/Organization name', example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  personName: string;

  @ApiProperty({ description: 'Debt amount', example: 10000000 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  amount: number;

  @ApiProperty({ description: 'Interest rate (annual %)', example: 5, required: false })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  interestRate?: number;

  @ApiProperty({ description: 'Borrowed date', example: '2025-01-01' })
  @IsDate()
  @Type(() => Date)
  borrowedDate: Date;

  @ApiProperty({ description: 'Due date', example: '2025-12-31', required: false })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  dueDate?: Date;

  @ApiProperty({ description: 'Description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Contact info', required: false })
  @IsString()
  @IsOptional()
  contactInfo?: string;
}

export class UpdateDebtDto {
  @IsString()
  @MaxLength(255)
  @IsOptional()
  personName?: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  amount?: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  interestRate?: number;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  dueDate?: Date;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  contactInfo?: string;
}

export class RecordDebtPaymentDto {
  @ApiProperty({ description: 'Payment amount (total)', example: 1000000 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @IsValidPaymentBreakdown()
  amount: number;

  @ApiProperty({ description: 'Principal amount', example: 900000 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  principalAmount: number;

  @ApiProperty({ description: 'Interest amount', example: 100000 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  interestAmount: number;

  @ApiProperty({
    description: 'Account ID for payment transaction',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  accountId?: string;

  @ApiProperty({
    description: 'Category ID for payment transaction',
    example: '550e8400-e29b-41d4-a716-446655440001',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @ApiProperty({ description: 'Payment date', example: '2025-01-15' })
  @IsDate()
  @Type(() => Date)
  paymentDate: Date;

  @ApiProperty({ description: 'Payment method', example: 'Bank Transfer', required: false })
  @IsString()
  @IsOptional()
  method?: string;

  @ApiProperty({ description: 'Payment reference', example: 'REF123456', required: false })
  @IsString()
  @IsOptional()
  reference?: string;

  @ApiProperty({ description: 'Note', required: false })
  @IsString()
  @IsOptional()
  note?: string;
}
