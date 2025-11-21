import { PartialType } from '@nestjs/swagger';
import { CreateSharedBookDto } from './create-shared-book.dto';

/**
 * DTO for updating shared book
 */
export class UpdateSharedBookDto extends PartialType(CreateSharedBookDto) {}
