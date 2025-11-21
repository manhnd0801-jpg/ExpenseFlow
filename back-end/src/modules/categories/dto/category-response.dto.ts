import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

/**
 * Response DTO for category
 */
@Exclude()
export class CategoryResponseDto {
  @Expose()
  @ApiProperty({ description: 'Category ID' })
  id: string;

  @Expose()
  @ApiProperty({ description: 'User ID' })
  userId: string;

  @Expose()
  @ApiProperty({ description: 'Category name' })
  name: string;

  @Expose()
  @ApiProperty({ description: 'Category type: 1=Income, 2=Expense' })
  type: number;

  @Expose()
  @ApiProperty({ description: 'Icon name', required: false })
  icon?: string;

  @Expose()
  @ApiProperty({ description: 'Color (hex)', required: false })
  color?: string;

  @Expose()
  @ApiProperty({ description: 'Description', required: false })
  description?: string;

  @Expose()
  @ApiProperty({ description: 'Is default category' })
  isDefault: boolean;

  @Expose()
  @ApiProperty({ description: 'Is active' })
  isActive: boolean;

  @Expose()
  @ApiProperty({ description: 'Created at timestamp' })
  createdAt: Date;

  @Expose()
  @ApiProperty({ description: 'Updated at timestamp' })
  updatedAt: Date;
}
