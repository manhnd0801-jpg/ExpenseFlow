import { ApiProperty } from '@nestjs/swagger';

/**
 * Standard API Response Interface
 * This format is automatically applied by ResponseInterceptor
 * Controllers should NOT return this format manually
 *
 * @example
 * // ✅ CORRECT - Controller returns plain DTO:
 * async create(): Promise<TransactionResponseDto> {
 *   return plainToInstance(TransactionResponseDto, transaction);
 * }
 *
 * // ❌ INCORRECT - Controller returns wrapped format:
 * async create(): Promise<{ success: boolean; data: TransactionResponseDto; message: string }> {
 *   return { success: true, data: transaction, message: '...' };
 * }
 */
export interface IApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

/**
 * Paginated Response DTO
 * Used for endpoints that return paginated data
 *
 * @example
 * async findAll(@Query() query: QueryDto): Promise<PaginatedResponseDto<EntityResponseDto>> {
 *   const { data, total } = await this.service.findAll(query);
 *
 *   return {
 *     items: plainToInstance(EntityResponseDto, data),
 *     total,
 *     page: Number(query.page || 1),
 *     limit: Number(query.limit || 20),
 *     totalPages: Math.ceil(total / (query.limit || 20)),
 *   };
 * }
 */
export class PaginatedResponseDto<T> {
  @ApiProperty({
    description: 'Array of items',
    isArray: true,
  })
  items: T[];

  @ApiProperty({
    example: 100,
    description: 'Total count of items matching the query',
  })
  total: number;

  @ApiProperty({
    example: 1,
    description: 'Current page number (1-indexed)',
  })
  page: number;

  @ApiProperty({
    example: 20,
    description: 'Number of items per page',
  })
  limit: number;

  @ApiProperty({
    example: 5,
    description: 'Total number of pages',
  })
  totalPages: number;
}

/**
 * Helper function to create paginated response
 *
 * @example
 * const result = await this.service.findAll(query);
 * return createPaginatedResponse(
 *   plainToInstance(EntityResponseDto, result.data),
 *   result.total,
 *   query.page,
 *   query.limit
 * );
 */
export function createPaginatedResponse<T>(
  items: T[],
  total: number,
  page: number = 1,
  limit: number = 20,
): PaginatedResponseDto<T> {
  return {
    items,
    total,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Swagger Response Decorator Helper
 * Use this to properly document API responses in Swagger
 *
 * @example
 * @ApiResponse({
 *   status: 200,
 *   description: 'Transaction retrieved successfully',
 *   ...apiResponseSchema(TransactionResponseDto)
 * })
 */
export function apiResponseSchema(dto: any) {
  return {
    schema: {
      properties: {
        success: { type: 'boolean', example: true },
        data: { $ref: `#/components/schemas/${dto.name}` },
        message: { type: 'string', example: 'Operation successful' },
      },
    },
  };
}

/**
 * Swagger Paginated Response Decorator Helper
 *
 * @example
 * @ApiResponse({
 *   status: 200,
 *   description: 'Transactions retrieved successfully',
 *   ...apiPaginatedResponseSchema(TransactionResponseDto)
 * })
 */
export function apiPaginatedResponseSchema(dto: any) {
  return {
    schema: {
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: { $ref: `#/components/schemas/${dto.name}` },
            },
            total: { type: 'number', example: 100 },
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 20 },
            totalPages: { type: 'number', example: 5 },
          },
        },
        message: { type: 'string', example: 'Operation successful' },
      },
    },
  };
}
