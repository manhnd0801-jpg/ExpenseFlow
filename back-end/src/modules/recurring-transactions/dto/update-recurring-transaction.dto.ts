import { PartialType } from '@nestjs/swagger';
import { CreateRecurringTransactionDto } from './create-recurring-transaction.dto';

/**
 * DTO for updating recurring transaction
 */
export class UpdateRecurringTransactionDto extends PartialType(CreateRecurringTransactionDto) {}
