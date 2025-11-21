import { PartialType } from '@nestjs/swagger';
import { CreateLoanDto } from './create-loan.dto';

/**
 * DTO for updating loan
 * All fields are optional
 */
export class UpdateLoanDto extends PartialType(CreateLoanDto) {}
