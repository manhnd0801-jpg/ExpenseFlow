import { Type } from 'class-transformer';
import { IsEmail, IsEnum, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export enum Environment {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
  TEST = 'test',
}

export class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @Type(() => Number)
  @IsNumber()
  @Min(1000)
  @Max(65535)
  PORT: number;

  // Database Configuration
  @IsString()
  DB_HOST: string;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(65535)
  DB_PORT: number;

  @IsString()
  DB_USERNAME: string;

  @IsString()
  DB_PASSWORD: string;

  @IsString()
  DB_DATABASE: string;

  // JWT Configuration
  @IsString()
  JWT_SECRET: string;

  @IsString()
  JWT_EXPIRES_IN: string;

  @IsString()
  JWT_REFRESH_SECRET: string;

  @IsString()
  JWT_REFRESH_EXPIRES_IN: string;

  // Redis Configuration
  @IsString()
  REDIS_HOST: string;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(65535)
  REDIS_PORT: number;

  @IsString()
  @IsOptional()
  REDIS_PASSWORD?: string;

  // Email Configuration (Optional)
  @IsString()
  @IsOptional()
  SMTP_HOST?: string;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  SMTP_PORT?: number;

  @IsEmail()
  @IsOptional()
  SMTP_USER?: string;

  @IsString()
  @IsOptional()
  SMTP_PASS?: string;

  // Upload Configuration
  @Type(() => Number)
  @IsNumber()
  @Min(1024)
  MAX_FILE_SIZE: number;

  @IsString()
  UPLOAD_PATH: string;

  // Rate Limiting
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  THROTTLE_TTL: number;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  THROTTLE_LIMIT: number;
}

export const validate = (config: Record<string, unknown>) => {
  const validatedConfig = new EnvironmentVariables();
  Object.assign(validatedConfig, config);
  return validatedConfig;
};