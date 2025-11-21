import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  healthCheck() {
    return {
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'expense-flow-backend',
      version: '1.0.0',
    };
  }

  @Get('health/db')
  @ApiOperation({ summary: 'Database health check' })
  @ApiResponse({ status: 200, description: 'Database is healthy' })
  @ApiResponse({ status: 503, description: 'Database is unhealthy' })
  async databaseHealth() {
    try {
      // Execute simple query to check database connection
      await this.dataSource.query('SELECT 1');

      return {
        success: true,
        status: 'healthy',
        database: 'connected',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        status: 'unhealthy',
        database: 'disconnected',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get()
  @ApiOperation({ summary: 'API root endpoint' })
  @ApiResponse({ status: 200, description: 'Welcome message' })
  getRoot() {
    return {
      success: true,
      message: 'Welcome to ExpenseFlow API',
      version: '1.0.0',
      documentation: '/api/docs',
      endpoints: {
        health: '/health',
        databaseHealth: '/health/db',
        swagger: '/api/docs',
      },
    };
  }
}
