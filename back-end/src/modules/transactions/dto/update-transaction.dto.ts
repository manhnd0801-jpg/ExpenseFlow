import { PartialType } from '@nestjs/swagger';
import { CreateTransactionDto } from './create-transaction.dto';

/**
 * DTO for updating a transaction
 * All fields are optional (extends PartialType of CreateTransactionDto)
 */
export class UpdateTransactionDto extends PartialType(CreateTransactionDto) {}
