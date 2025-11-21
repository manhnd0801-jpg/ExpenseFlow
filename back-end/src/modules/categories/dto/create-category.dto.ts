import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

/**
 * DTO for creating a category
 * CRITICAL: type field uses INTEGER (1=Income, 2=Expense)
 */
export class CreateCategoryDto {
  @ApiProperty({
    description: 'Category name',
    example: 'Food & Dining',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Category type: 1=Income, 2=Expense',
    example: 2,
    enum: [1, 2],
  })
  @IsInt()
  @Min(1)
  @Max(2)
  @Type(() => Number)
  type: number;

  @ApiProperty({
    description: 'Category icon name',
    example: 'utensils',
    maxLength: 50,
    required: false,
  })
  @IsString()
  @MaxLength(50)
  @IsOptional()
  icon?: string;

  @ApiProperty({
    description: 'Category color (hex code)',
    example: '#FF6B6B',
    maxLength: 7,
    required: false,
  })
  @IsString()
  @MaxLength(7)
  @IsOptional()
  color?: string;

  @ApiProperty({
    description: 'Category description',
    example: 'All food and dining expenses',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Is category active',
    example: true,
    required: false,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
