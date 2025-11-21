import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsEmail, IsInt, IsNotEmpty, IsOptional, Max, Min } from 'class-validator';

/**
 * DTO for adding member to shared book
 */
export class AddMemberDto {
  @ApiProperty({ example: 'user@example.com', description: 'Email of user to add' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Member role',
    enum: [1, 2, 3],
    example: 2,
    type: 'integer',
  })
  @IsInt()
  @Min(1)
  @Max(3)
  @Type(() => Number)
  role: number; // 1=Viewer, 2=Editor, 3=Admin
}

/**
 * DTO for updating member role
 */
export class UpdateMemberRoleDto {
  @ApiProperty({
    description: 'New role for member',
    enum: [1, 2, 3],
    example: 2,
    type: 'integer',
  })
  @IsInt()
  @Min(1)
  @Max(3)
  @Type(() => Number)
  role: number;
}

/**
 * DTO for querying shared books
 */
export class QuerySharedBookDto {
  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({ example: 20, default: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number;

  @ApiPropertyOptional({ description: 'Filter by active status' })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean;
}

export { CreateSharedBookDto } from './create-shared-book.dto';
export { UpdateSharedBookDto } from './update-shared-book.dto';
