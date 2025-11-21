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

  @ApiProperty({ description: 'Note', required: false })
  @IsString()
  @IsOptional()
  note?: string;
}
