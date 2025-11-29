import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

/**
 * Account Response DTO
 * Used for API responses containing account data
 */
export class AccountResponseDto {
  @ApiProperty({ example: 'uuid', description: 'Account ID' })
  @Expose()
  id: string;

  @ApiProperty({ example: 'uuid', description: 'User ID' })
  @Expose()
  userId: string;

  @ApiProperty({ example: 'Cash Wallet', description: 'Account name' })
  @Expose()
  name: string;

  @ApiProperty({
    example: 1,
    description: 'Account type: 1=Cash, 2=Bank, 3=Credit Card, 4=E-Wallet, 5=Investment',
  })
  @Expose()
  type: number;

  @ApiProperty({ example: 5000000, description: 'Current balance' })
  @Expose()
  balance: number;

  @ApiProperty({
    example: 1,
    description: 'Currency: 1=VND, 2=USD, 3=EUR, 4=JPY, 5=CNY',
  })
  @Expose()
  currency: number;

  @ApiProperty({ example: 'Vietcombank', description: 'Bank name', required: false })
  @Expose()
  bankName?: string;

  @ApiProperty({ example: '1234567890', description: 'Account number', required: false })
  @Expose()
  accountNumber?: string;

  @ApiProperty({ example: 'My savings account', description: 'Description', required: false })
  @Expose()
  description?: string;

  @ApiProperty({ example: '#FF6B6B', description: 'Color (hex)', required: false })
  @Expose()
  color?: string;

  @ApiProperty({ example: 'wallet', description: 'Icon name', required: false })
  @Expose()
  icon?: string;

  @ApiProperty({ example: true, description: 'Is active' })
  @Expose()
  isActive: boolean;

  @ApiProperty({ example: true, description: 'Include in total balance' })
  @Expose()
  includeInTotal: boolean;

  @ApiProperty({ example: 50000000, description: 'Credit limit (for credit cards)', required: false })
  @Expose()
  creditLimit?: number;

  @ApiProperty({ example: 0.5, description: 'Interest rate (%)', required: false })
  @Expose()
  interestRate?: number;

  @ApiProperty({ example: '2025-11-29T08:00:00Z', description: 'Created date' })
  @Expose()
  createdAt: string;

  @ApiProperty({ example: '2025-11-29T08:00:00Z', description: 'Updated date' })
  @Expose()
  updatedAt: string;
}
