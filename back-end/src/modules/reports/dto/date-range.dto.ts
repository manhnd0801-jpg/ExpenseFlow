import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsOptional, IsUUID } from 'class-validator';

export class DateRangeDto {
  @ApiProperty({
    example: '2024-01-01',
    description: 'Ngày bắt đầu (YYYY-MM-DD)',
  })
  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @ApiProperty({
    example: '2024-01-31',
    description: 'Ngày kết thúc (YYYY-MM-DD)',
  })
  @IsDate()
  @Type(() => Date)
  endDate: Date;

  @ApiProperty({
    example: 'uuid-of-account',
    description: 'Lọc theo tài khoản (optional)',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  accountId?: string;

  @ApiProperty({
    example: 'uuid-of-category',
    description: 'Lọc theo danh mục (optional)',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  categoryId?: string;
}
