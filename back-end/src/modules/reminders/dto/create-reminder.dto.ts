import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateReminderDto {
  @ApiProperty({
    example: 'Thanh toán hóa đơn điện',
    description: 'Tiêu đề nhắc nhở',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiProperty({
    example: 'Nhớ thanh toán hóa đơn điện trước ngày 15',
    description: 'Mô tả chi tiết',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 1,
    description: 'Loại nhắc nhở (1=Payment, 2=Budget, 3=Goal, 4=Custom) - MUST use integer',
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(4)
  @Type(() => Number)
  type: number;

  @ApiProperty({
    example: '2024-01-15T10:00:00Z',
    description: 'Ngày giờ nhắc nhở',
  })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  reminderDate: Date;

  @ApiProperty({
    example: false,
    description: 'Có lặp lại hay không',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @ApiProperty({
    example: 4,
    description: 'Tần suất lặp lại (1=Once, 2=Daily, 3=Weekly, 4=Monthly, 5=Quarterly, 6=Yearly)',
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(6)
  @Type(() => Number)
  recurringType?: number;

  @ApiProperty({
    example: 'uuid-of-related-entity',
    description: 'ID của entity liên quan (budget, goal, debt, etc.)',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  relatedEntityId?: string;

  @ApiProperty({
    example: 'budget',
    description: 'Loại entity liên quan (budget, goal, debt, transaction)',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  relatedEntityType?: string;
}
