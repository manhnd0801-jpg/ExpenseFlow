import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEmail, IsInt, IsOptional, IsString, Max, Min, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ 
    example: 'user@example.com',
    description: 'User email address'
  })
  @IsEmail({}, { message: 'Email must be valid' })
  email: string;

  @ApiProperty({ 
    example: 'securePassword123',
    description: 'User password (minimum 6 characters)',
    minLength: 6
  })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @ApiProperty({ 
    example: 'John',
    description: 'User first name'
  })
  @IsString()
  @MinLength(1, { message: 'First name is required' })
  firstName: string;

  @ApiProperty({ 
    example: 'Doe',
    description: 'User last name'
  })
  @IsString()
  @MinLength(1, { message: 'Last name is required' })
  lastName: string;

  @ApiProperty({ 
    example: 1,
    description: 'Default currency (1=VND, 2=USD, 3=EUR, 4=JPY, 5=CNY)',
    required: false,
    minimum: 1,
    maximum: 5
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Default currency must be an integer' })
  @Min(1, { message: 'Invalid currency value' })
  @Max(5, { message: 'Invalid currency value' })
  defaultCurrency?: number;

  @ApiProperty({ 
    example: 'vi',
    description: 'User preferred language',
    required: false
  })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiProperty({ 
    example: 'Asia/Ho_Chi_Minh',
    description: 'User timezone',
    required: false
  })
  @IsOptional()
  @IsString()
  timezone?: string;
}