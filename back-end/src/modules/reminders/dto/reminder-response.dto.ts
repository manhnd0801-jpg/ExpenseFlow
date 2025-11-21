import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class ReminderResponseDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  userId: string;

  @Expose()
  @ApiProperty()
  title: string;

  @Expose()
  @ApiProperty()
  description?: string;

  @Expose()
  @ApiProperty({ example: 1, description: '1=Payment, 2=Budget, 3=Goal, 4=Custom' })
  type: number;

  @Expose()
  @ApiProperty()
  reminderDate: Date;

  @Expose()
  @ApiProperty()
  isRecurring: boolean;

  @Expose()
  @ApiProperty({ example: 4, description: '4=Monthly' })
  recurringType?: number;

  @Expose()
  @ApiProperty({ example: 1, description: '1=Pending, 2=Completed, 3=Cancelled' })
  status: number;

  @Expose()
  @ApiProperty()
  relatedEntityId?: string;

  @Expose()
  @ApiProperty()
  relatedEntityType?: string;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty()
  updatedAt: Date;
}
