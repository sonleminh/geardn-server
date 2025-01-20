import { Prisma } from '@prisma/client'; // Import Prisma error classes
import {
  HttpStatus,
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { LoggerFactory } from '../logger/custom.logger';
import { HttpArgumentsHost } from '@nestjs/common/interfaces/features/arguments-host.interface';
import { Response, Request } from 'express';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerFactory) {}

  private static handleResponse(
    response: Response,
    responseBody: any,
    statusCode: number,
  ): void {
    response.status(statusCode).json(responseBody);
  }

  catch(
    exception: HttpException | Error | Prisma.PrismaClientKnownRequestError,
    host: ArgumentsHost,
  ): void {
    const ctx: HttpArgumentsHost = host.switchToHttp();
    const request: Request = ctx.getRequest();
    const response: Response = ctx.getResponse();

    let responseBody;

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      responseBody = {
        message: exception.message,
        statusCode: HttpStatus.BAD_REQUEST,
      };
    } else if (exception instanceof HttpException) {
      const errRes = exception.getResponse();
      responseBody = {
        ...(typeof errRes === 'object' ? { ...errRes } : { message: errRes }),
        statusCode: exception.getStatus(),
      };
    } else if (exception instanceof Error) {
      responseBody = {
        message: exception.message,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    } else {
      responseBody = {
        message: 'Internal server error',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }

    // Handle logging and response
    this.handleMessage(request, exception, responseBody.statusCode);

    AllExceptionFilter.handleResponse(
      response,
      responseBody.statusCode === HttpStatus.INTERNAL_SERVER_ERROR
        ? 'Internal server error'
        : responseBody,
      responseBody.statusCode,
    );
  }

  private handleMessage(
    request: Request,
    exception: HttpException | Error | Prisma.PrismaClientKnownRequestError,
    statusCode: number,
  ): void {
    const { method, originalUrl, user } = request;

    let errorMessage: string;

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      errorMessage = exception.message;
    } else if (exception instanceof HttpException) {
      errorMessage = JSON.stringify(exception.getResponse());
    } else if (exception instanceof Error) {
      errorMessage = exception?.stack?.toString() ?? '';
    } else {
      errorMessage = 'Unknown error';
    }

    const log = `${method} ${statusCode} ${(user as any)?.username ?? 'N/A'} ${originalUrl} ${exception?.name} ${errorMessage}`;
    this.logger.error(log);
  }
}
