/**
 * Example Controller - Best Practices
 * Demonstrates correct usage of response formats with ResponseInterceptor
 */

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { GetUser, JwtAuthGuard } from '../../common';
import {
  apiPaginatedResponseSchema,
  apiResponseSchema,
  createPaginatedResponse,
  PaginatedResponseDto,
} from '../../common/dto';

// Example DTOs
class CreateExampleDto {
  name: string;
  description?: string;
}

class UpdateExampleDto {
  name?: string;
  description?: string;
}

class ExampleResponseDto {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

class QueryExampleDto {
  page?: number;
  limit?: number;
  search?: string;
}

/**
 * ✅ CORRECT PATTERNS - Controller returns plain DTOs
 * ResponseInterceptor automatically wraps responses in { success, data, message }
 */
@ApiTags('Examples')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('examples')
export class ExampleController {
  constructor(private readonly exampleService: any) {}

  /**
   * ✅ Pattern 1: Create Single Entity
   * Return Type: Promise<EntityResponseDto>
   */
  @Post()
  @ApiOperation({ summary: 'Create a new example' })
  @ApiResponse({
    status: 201,
    description: 'Example created successfully',
    ...apiResponseSchema(ExampleResponseDto),
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(@GetUser('id') userId: string, @Body() createDto: CreateExampleDto): Promise<ExampleResponseDto> {
    const example = await this.exampleService.create(userId, createDto);

    // ✅ Return plain DTO - ResponseInterceptor will wrap it
    return plainToInstance(ExampleResponseDto, example, {
      excludeExtraneousValues: false,
    });
  }

  /**
   * ✅ Pattern 2: Get Single Entity by ID
   * Return Type: Promise<EntityResponseDto>
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get example by ID' })
  @ApiResponse({
    status: 200,
    description: 'Example retrieved successfully',
    ...apiResponseSchema(ExampleResponseDto),
  })
  @ApiResponse({ status: 404, description: 'Example not found' })
  async findOne(@Param('id') id: string): Promise<ExampleResponseDto> {
    const example = await this.exampleService.findOne(id);

    // ✅ Return plain DTO
    return plainToInstance(ExampleResponseDto, example);
  }

  /**
   * ✅ Pattern 3: Get All (Simple Array)
   * Return Type: Promise<EntityResponseDto[]>
   */
  @Get('user/all')
  @ApiOperation({ summary: 'Get all examples for current user (no pagination)' })
  @ApiResponse({
    status: 200,
    description: 'Examples retrieved successfully',
    schema: {
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/ExampleResponseDto' },
        },
        message: { type: 'string', example: 'Operation successful' },
      },
    },
  })
  async findAllByUser(@GetUser('id') userId: string): Promise<ExampleResponseDto[]> {
    const examples = await this.exampleService.findByUser(userId);

    // ✅ Return array of DTOs - plainToInstance handles arrays automatically
    // plainToInstance returns ExampleResponseDto | ExampleResponseDto[] based on input
    return plainToInstance(ExampleResponseDto, examples, {
      excludeExtraneousValues: false,
    }) as any;
  }

  /**
   * ✅ Pattern 4: Get All with Pagination (RECOMMENDED)
   * Return Type: Promise<PaginatedResponseDto<EntityResponseDto>>
   */
  @Get()
  @ApiOperation({ summary: 'Get all examples with pagination and filters' })
  @ApiResponse({
    status: 200,
    description: 'Examples retrieved successfully',
    ...apiPaginatedResponseSchema(ExampleResponseDto),
  })
  async findAll(@Query() query: QueryExampleDto): Promise<PaginatedResponseDto<ExampleResponseDto>> {
    const { data, total } = await this.exampleService.findAll(query);

    // ✅ Method 1: Use helper function
    return createPaginatedResponse(
      plainToInstance(ExampleResponseDto, data, {
        excludeExtraneousValues: false,
      }) as any,
      total,
      query.page || 1,
      query.limit || 20,
    );

    // ✅ Method 2: Manual construction (equivalent)
    // return {
    //   items: plainToInstance(ExampleResponseDto, data),
    //   total,
    //   page: Number(query.page || 1),
    //   limit: Number(query.limit || 20),
    //   totalPages: Math.ceil(total / (query.limit || 20)),
    // };
  }

  /**
   * ✅ Pattern 5: Update Entity
   * Return Type: Promise<EntityResponseDto>
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Update example' })
  @ApiResponse({
    status: 200,
    description: 'Example updated successfully',
    ...apiResponseSchema(ExampleResponseDto),
  })
  @ApiResponse({ status: 404, description: 'Example not found' })
  async update(@Param('id') id: string, @Body() updateDto: UpdateExampleDto): Promise<ExampleResponseDto> {
    const example = await this.exampleService.update(id, updateDto);

    // ✅ Return plain DTO
    return plainToInstance(ExampleResponseDto, example);
  }

  /**
   * ✅ Pattern 6: Delete Entity (No Content)
   * Return Type: Promise<void>
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete example' })
  @ApiResponse({ status: 204, description: 'Example deleted successfully' })
  @ApiResponse({ status: 404, description: 'Example not found' })
  async delete(@Param('id') id: string): Promise<void> {
    await this.exampleService.delete(id);

    // ✅ Return nothing - ResponseInterceptor will still wrap with success=true
    return;
  }

  /**
   * ✅ Pattern 7: Custom Return Type (Non-entity)
   * Return Type: Promise<CustomType>
   */
  @Get('stats/summary')
  @ApiOperation({ summary: 'Get statistics summary' })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
    schema: {
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            totalCount: { type: 'number', example: 100 },
            averageValue: { type: 'number', example: 75.5 },
            lastUpdated: { type: 'string', example: '2025-11-29T08:00:00Z' },
          },
        },
        message: { type: 'string', example: 'Operation successful' },
      },
    },
  })
  async getStats(): Promise<{ totalCount: number; averageValue: number; lastUpdated: Date }> {
    const stats = await this.exampleService.getStats();

    // ✅ Return custom object - ResponseInterceptor will wrap and transform Dates
    return stats;
  }
}

/**
 * ❌ INCORRECT PATTERNS - DO NOT USE
 */
class IncorrectExampleController {
  /**
   * ❌ WRONG: Controller manually wraps response
   * Problem: ResponseInterceptor will wrap again → double nesting
   */
  // async create(): Promise<{ success: boolean; data: ExampleResponseDto; message: string }> {
  //   const example = await this.exampleService.create();
  //   return {
  //     success: true,
  //     data: plainToInstance(ExampleResponseDto, example),
  //     message: 'Created successfully',
  //   };
  // }
  /**
   * ❌ WRONG: Using 'data' instead of 'items' for pagination
   * Problem: Frontend expects 'items' field
   */
  // async findAll(): Promise<{ data: ExampleResponseDto[]; total: number }> {
  //   const { data, total } = await this.exampleService.findAll();
  //   return { data, total }; // ← Should use 'items' field
  // }
  /**
   * ❌ WRONG: Returning raw entity without DTO transformation
   * Problem: Exposes internal entity structure, no field transformation
   */
  // async findOne(id: string): Promise<Example> {
  //   return this.exampleService.findOne(id); // ← Should use plainToInstance
  // }
}

/**
 * ACTUAL RESPONSE FORMATS (after ResponseInterceptor):
 *
 * 1. Single Entity:
 * {
 *   "success": true,
 *   "data": {
 *     "id": "uuid",
 *     "name": "Example",
 *     "description": "...",
 *     "createdAt": "2025-11-29T08:00:00.000Z",
 *     "updatedAt": "2025-11-29T08:00:00.000Z"
 *   },
 *   "message": "Operation successful"
 * }
 *
 * 2. Array:
 * {
 *   "success": true,
 *   "data": [
 *     { "id": "uuid1", ... },
 *     { "id": "uuid2", ... }
 *   ],
 *   "message": "Operation successful"
 * }
 *
 * 3. Paginated:
 * {
 *   "success": true,
 *   "data": {
 *     "items": [
 *       { "id": "uuid1", ... },
 *       { "id": "uuid2", ... }
 *     ],
 *     "total": 100,
 *     "page": 1,
 *     "limit": 20,
 *     "totalPages": 5
 *   },
 *   "message": "Operation successful"
 * }
 *
 * 4. Delete (No Content):
 * {
 *   "success": true,
 *   "data": undefined,
 *   "message": "Operation successful"
 * }
 */
