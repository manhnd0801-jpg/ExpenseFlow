import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsObject, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class CreateNotificationDto {
  @ApiProperty({
    example: 1,
    description: 'Loại thông báo (1=Budget Alert, 2=Payment Due, 3=Goal Progress, 4=Debt Reminder, 5=System)',
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  type: number;

  @ApiProperty({
    example: 'Budget Alert',
    description: 'Tiêu đề thông báo',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiProperty({
    example: 'You have exceeded 80% of your monthly budget',
    description: 'Nội dung thông báo',
  })
  @IsNotEmpty()
  @IsString()
  message: string;

  @ApiProperty({
    example: { budgetId: 'uuid', percentage: 85 },
    description: 'Dữ liệu bổ sung',
    required: false,
  })
  @IsOptional()
  @IsObject()
  data?: Record<string, any>;

  @ApiProperty({
    example: '/budgets/uuid',
    description: 'URL để deep link',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  actionUrl?: string;
}
