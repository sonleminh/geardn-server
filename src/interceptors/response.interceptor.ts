import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((originalData) => {
        const isObject =
          typeof originalData === 'object' && originalData !== null;

        if (isObject && 'success' in originalData) {
          return originalData;
        }
        // Nếu data là object và có `message` bên trong, trích xuất `message` ra ngoài
        const message =
          (isObject && originalData.message) ||
          (typeof originalData === 'string'
            ? originalData
            : 'Request successful');

        let data = null;
        let meta = undefined;
        if (isObject && 'data' in originalData) {
          data = originalData.data;
          if ('meta' in originalData) {
            meta = originalData.meta;
          } else if ('total' in originalData) {
            meta = { total: originalData.total };
          }
        } else if (isObject) {
          const keys = Object.keys(originalData);
          const isOnlyMessage = keys.length === 1 && keys.includes('message');

          if (!isOnlyMessage) {
            data = originalData;
          }
        }
        const response: Record<string, any> = {
          success: true,
          message,
        };

        if (data !== null) {
          response.data = data;
        }

        if (meta) {
          response.meta = meta;
        }

        return response;
      }),
    );
  }
}
