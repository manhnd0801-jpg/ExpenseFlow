import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class CreateDebtDto {
  @ApiProperty({ description: 'Debt type: 1=Lending, 2=Borrowing', example: 1, enum: [1, 2] })
  @IsInt()
  @Min(1)
  @Max(2)
  @Type(() => Number)
  type: number;

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
  @ApiProperty({ description: 'Payment amount', example: 1000000 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  amount: number;

  @ApiProperty({ description: 'Payment date', example: '2025-01-15' })
  @IsDate()
  @Type(() => Date)
  paymentDate: Date;

  @ApiProperty({ description: 'Note', required: false })
  @IsString()
  @IsOptional()
  note?: string;
}
