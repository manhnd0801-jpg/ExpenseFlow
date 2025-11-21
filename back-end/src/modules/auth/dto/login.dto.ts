import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ 
    example: 'user@example.com',
    description: 'User email address'
  })
  @IsEmail({}, { message: 'Email must be valid' })
  email: string;

  @ApiProperty({ 
    example: 'securePassword123',
    description: 'User password'
  })
  @IsString()
  password: string;
}