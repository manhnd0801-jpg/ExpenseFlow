import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';

/**
 * Response DTO for transaction with relations
 */
@Exclude()
export class TransactionResponseDto {
  @Expose()
  @ApiProperty({ description: 'Transaction ID' })
  id: string;

  @Expose()
  @ApiProperty({ description: 'User ID' })
  userId: string;

  @Expose()
  @ApiProperty({ description: 'Account ID' })
  accountId: string;

  @Expose()
  @ApiProperty({ description: 'Category ID', required: false })
  categoryId?: string;

  @Expose()
  @ApiProperty({ description: 'Event ID', required: false })
  eventId?: string;

  @Expose()
  @ApiProperty({ description: 'Transaction type: 1=Income, 2=Expense, 3=Transfer' })
  type: number;

  @Expose()
  @ApiProperty({ description: 'Transaction amount' })
  amount: number;

  @Expose()
  @ApiProperty({ description: 'Transaction date' })
  date: Date;

  @Expose()
  @ApiProperty({ description: 'Description', required: false })
  description?: string;

  @Expose()
  @ApiProperty({ description: 'Note', required: false })
  note?: string;

  @Expose()
  @ApiProperty({ description: 'Receipt image URL', required: false })
  receiptImage?: string;

  @Expose()
  @ApiProperty({ description: 'Location', required: false })
  location?: string;

  @Expose()
  @ApiProperty({ description: 'Reference number', required: false })
  reference?: string;

  @Expose()
  @ApiProperty({ description: 'Tags', type: [String], required: false })
  tags?: string[];

  @Expose()
  @ApiProperty({ description: 'To account ID (for transfers)', required: false })
  toAccountId?: string;

  @Expose()
  @ApiProperty({ description: 'Is recurring transaction' })
  isRecurring: boolean;

  @Expose()
  @ApiProperty({ description: 'Account details', required: false })
  @Type(() => Object)
  account?: {
    id: string;
    name: string;
    type: number;
    currency: number;
  };

  @Expose()
  @ApiProperty({ description: 'Category details', required: false })
  @Type(() => Object)
  category?: {
    id: string;
    name: string;
    type: number;
    icon: string;
    color: string;
  };

  @Expose()
  @ApiProperty({ description: 'To Account details (for transfers)', required: false })
  @Type(() => Object)
  toAccount?: {
    id: string;
    name: string;
    type: number;
  };

  @Expose()
  @ApiProperty({ description: 'Event details', required: false })
  @Type(() => Object)
  event?: {
    id: string;
    name: string;
    startDate: Date;
    endDate: Date;
  };

  @Expose()
  @ApiProperty({ description: 'Created at timestamp' })
  createdAt: Date;

  @Expose()
  @ApiProperty({ description: 'Updated at timestamp' })
  updatedAt: Date;
}

/**
 * Paginated response for transactions
 */
export class PaginatedTransactionResponseDto {
  @ApiProperty({ type: [TransactionResponseDto] })
  data: TransactionResponseDto[];

  @ApiProperty({
    description: 'Pagination metadata',
    example: {
      page: 1,
      limit: 20,
      total: 150,
      totalPages: 8,
    },
  })
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
