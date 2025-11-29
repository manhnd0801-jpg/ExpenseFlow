import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateGoalDto {
  @ApiProperty({ description: 'Goal name', example: 'Buy a car' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({ description: 'Target amount', example: 500000000 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  targetAmount: number;

  @ApiProperty({ description: 'Current amount', example: 50000000, required: false })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  currentAmount?: number;

  @ApiProperty({ description: 'Deadline', example: '2026-12-31', required: false })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  deadline?: Date;

  @ApiProperty({ description: 'Description', required: false })
  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateGoalDto {
  @IsString()
  @MaxLength(255)
  @IsOptional()
  name?: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  targetAmount?: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  currentAmount?: number;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  deadline?: Date;

  @IsString()
  @IsOptional()
  description?: string;
}

export class ContributeGoalDto {
  @ApiProperty({ description: 'Contribution amount', example: 1000000 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  amount: number;

  @ApiProperty({ description: 'Account ID to deduct from', example: 'uuid' })
  @IsString()
  @IsNotEmpty()
  accountId: string;

  @ApiProperty({ description: 'Note', required: false })
  @IsString()
  @IsOptional()
  note?: string;
}

export class WithdrawGoalDto {
  @ApiProperty({ description: 'Withdrawal amount', example: 500000 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  amount: number;

  @ApiProperty({ description: 'Account ID to transfer to', example: 'uuid' })
  @IsString()
  @IsNotEmpty()
  accountId: string;

  @ApiProperty({ description: 'Reason for withdrawal', required: false })
  @IsString()
  @IsOptional()
  reason?: string;
}

export class DeleteGoalDto {
  @ApiProperty({
    description: 'Refund option',
    enum: ['REFUND_TO_ACCOUNT', 'TRANSFER_TO_GOAL', 'DELETE_WITHOUT_REFUND'],
    example: 'REFUND_TO_ACCOUNT',
  })
  @IsString()
  @IsOptional()
  refundOption?: 'REFUND_TO_ACCOUNT' | 'TRANSFER_TO_GOAL' | 'DELETE_WITHOUT_REFUND';

  @ApiProperty({ description: 'Target account ID (for REFUND_TO_ACCOUNT)', required: false })
  @IsString()
  @IsOptional()
  targetAccountId?: string;

  @ApiProperty({ description: 'Target goal ID (for TRANSFER_TO_GOAL)', required: false })
  @IsString()
  @IsOptional()
  targetGoalId?: string;
}
