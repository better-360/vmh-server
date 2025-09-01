import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  TokenMissingException,
  TokenInvalidException,
  InsufficientPermissionsException,
  ResourceAccessDeniedException,
} from '../exceptions/auth.exceptions';

@Catch(
  TokenMissingException,
  TokenInvalidException,
  InsufficientPermissionsException,
  ResourceAccessDeniedException,
)
export class AuthExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse() as any;

    // Auth hatalarını da loglayalım
    const errorLog = {
      timestamp: new Date().toISOString(),
      method: request.method,
      endpoint: request.url,
      error: {
        type: exception.constructor.name,
        message: exception.message,
        status: status,
        response: exceptionResponse,
      },
      userId: (request as any).user?.id || 'anonymous',
      ip: request.ip || request.connection?.remoteAddress,
      userAgent: request.headers['user-agent'],
    };

    console.log(`🔐 Auth Error: ${request.method} ${request.url} - ${exception.constructor.name} - Status: ${status}`);
    console.log('🔍 Auth Error Details:', JSON.stringify(errorLog, null, 2));

    response.status(status).json(exceptionResponse);
  }
}
