import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  data?: T;
  message?: string;
}

/**
 * Recursively transform data for consistent API responses
 * - Convert decimal strings to numbers
 * - Convert Date objects to ISO strings
 */
function transformData(data: any): any {
  if (data === null || data === undefined) {
    return data;
  }

  // Handle Date objects
  if (data instanceof Date) {
    return data.toISOString();
  }

  // Handle arrays
  if (Array.isArray(data)) {
    return data.map((item) => transformData(item));
  }

  // Handle objects
  if (typeof data === 'object') {
    const transformed: any = {};
    for (const [key, value] of Object.entries(data)) {
      // Convert Date objects to ISO strings
      if (value instanceof Date) {
        transformed[key] = value.toISOString();
      }
      // Convert string numbers that look like decimals to actual numbers
      else if (typeof value === 'string' && /^\d+\.\d+$/.test(value)) {
        transformed[key] = parseFloat(value);
      }
      // Handle nested objects/arrays
      else if (typeof value === 'object' || Array.isArray(value)) {
        transformed[key] = transformData(value);
      } else {
        transformed[key] = value;
      }
    }
    return transformed;
  }

  return data;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        // Transform data for consistent API responses
        const transformedData = transformData(data);

        return {
          success: true,
          data: transformedData as T,
          message: 'Operation successful',
        };
      }),
    );
  }
}
