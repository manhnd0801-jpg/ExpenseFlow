import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class CreateEventDto {
  @ApiProperty({ description: 'Event name', example: 'Family Vacation' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({ description: 'Description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Event type/category (1=Personal, 2=Family, 3=Travel, 4=Business, 5=Other)',
    enum: [1, 2, 3, 4, 5],
    example: 3,
    required: false,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  @IsOptional()
  type?: number;

  @ApiProperty({ description: 'Budget amount', example: 20000000, required: false })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  budget?: number;

  @ApiProperty({ description: 'Event location', example: 'Hà Nội', required: false })
  @IsString()
  @MaxLength(255)
  @IsOptional()
  location?: string;

  @ApiProperty({
    description: 'Event status (1=Planned, 2=Active, 3=Completed, 4=Cancelled)',
    enum: [1, 2, 3, 4],
    example: 2,
    required: false,
  })
  @IsInt()
  @Min(1)
  @Max(4)
  @Type(() => Number)
  @IsOptional()
  status?: number;

  @ApiProperty({ description: 'Start date', example: '2025-06-01' })
  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @ApiProperty({ description: 'End date', example: '2025-06-15', required: false })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  endDate?: Date;

  @ApiProperty({ description: 'Hex color code', example: '#FF5733', required: false })
  @IsString()
  @MaxLength(7)
  @IsOptional()
  color?: string;

  @ApiProperty({ description: 'Icon name', example: 'calendar', required: false })
  @IsString()
  @MaxLength(50)
  @IsOptional()
  icon?: string;

  @ApiProperty({
    description: 'Array of tags',
    example: ['holiday', 'family'],
    required: false,
    type: [String],
  })
  @IsOptional()
  tags?: string[];
}

export class UpdateEventDto {
  @ApiProperty({ description: 'Event name', example: 'Family Vacation', required: false })
  @IsString()
  @MaxLength(255)
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'Description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Event type/category (1=Personal, 2=Family, 3=Travel, 4=Business, 5=Other)',
    enum: [1, 2, 3, 4, 5],
    example: 3,
    required: false,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  @IsOptional()
  type?: number;

  @ApiProperty({ description: 'Budget amount', example: 20000000, required: false })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  budget?: number;

  @ApiProperty({ description: 'Event location', example: 'Hà Nội', required: false })
  @IsString()
  @MaxLength(255)
  @IsOptional()
  location?: string;

  @ApiProperty({
    description: 'Event status (1=Planned, 2=Active, 3=Completed, 4=Cancelled)',
    enum: [1, 2, 3, 4],
    example: 2,
    required: false,
  })
  @IsInt()
  @Min(1)
  @Max(4)
  @Type(() => Number)
  @IsOptional()
  status?: number;

  @ApiProperty({ description: 'Start date', example: '2025-06-01', required: false })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  startDate?: Date;

  @ApiProperty({ description: 'End date', example: '2025-06-15', required: false })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  endDate?: Date;

  @ApiProperty({ description: 'Hex color code', example: '#FF5733', required: false })
  @IsString()
  @MaxLength(7)
  @IsOptional()
  color?: string;

  @ApiProperty({ description: 'Icon name', example: 'calendar', required: false })
  @IsString()
  @MaxLength(50)
  @IsOptional()
  icon?: string;

  @ApiProperty({
    description: 'Array of tags',
    example: ['holiday', 'family'],
    required: false,
    type: [String],
  })
  @IsOptional()
  tags?: string[];
}
