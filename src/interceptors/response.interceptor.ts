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
        const isObject = typeof originalData === 'object' && originalData !== null;

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
          data = originalData;
        }

        const response: Record<string, any> = {
          success: true,
          message,
          data,
        };

        if (meta) {
          response.meta = meta;
        }

        return response;
        // // Nếu data có key `data`, giữ nguyên
        // if (typeof originalData === 'object' && 'data' in originalData) {
        //   return {
        //     success: true,
        //     message,
        //     data: originalData.data, // Không wrap thêm `data`
        //     total: originalData.total ?? undefined,
        //   };
        // }

        // // Nếu `data` chỉ là message string -> Trả về đúng format
        // if (typeof originalData === 'string') {
        //   return {
        //     success: true,
        //     message: originalData, // Trả về message chuẩn
        //     data: null, // Không wrap thêm
        //   };
        // }

        // // Trường hợp `data` là một object nhưng không có `data` -> Giữ nguyên
        // return {
        //   success: true,
        //   message,
        //   data: Object.keys(originalData).length > 1 ? originalData : null, // Nếu object chỉ có `message`, không wrap `data`
        // };
      }),
    );
  }
}
