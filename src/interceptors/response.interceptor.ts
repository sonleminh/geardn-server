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
      map((data) => {
        // Nếu data là object và có `message` bên trong, trích xuất `message` ra ngoài
        const message = data?.message || 'Request successful';

        // Nếu data có key `data`, giữ nguyên
        if (typeof data === 'object' && 'data' in data) {
          return {
            success: true,
            message,
            data: data.data, // Không wrap thêm `data`
            total: data.total ?? undefined,
          };
        }

        // Nếu `data` chỉ là message string -> Trả về đúng format
        if (typeof data === 'string') {
          return {
            success: true,
            message: data, // Trả về message chuẩn
            data: null, // Không wrap thêm
          };
        }

        // Trường hợp `data` là một object nhưng không có `data` -> Giữ nguyên
        return {
          success: true,
          message,
          data: Object.keys(data).length > 1 ? data : null, // Nếu object chỉ có `message`, không wrap `data`
        };
      }),
    );
  }
}
