import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class RequestLoggerInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, query, params, headers } = request;
    
    // Hassas bilgileri filtrele
    const sanitizedBody = this.sanitizeData(body);
    const sanitizedHeaders = this.sanitizeHeaders(headers);
    
    const logData = {
      timestamp: new Date().toISOString(),
      method,
      endpoint: url,
      params: params || {},
      query: query || {},
      body: sanitizedBody,
      userAgent: headers['user-agent'],
      ip: request.ip || request.connection?.remoteAddress,
      userId: request.user?.id || 'anonymous',
    };

    console.log('📥 Incoming Request:', JSON.stringify(logData, null, 2));

    return next.handle().pipe(
      tap({
        next: (response) => {
          console.log(`✅ Request completed: ${method} ${url} - Status: SUCCESS`);
        },
        error: (error) => {
          const errorLog = {
            timestamp: new Date().toISOString(),
            method,
            endpoint: url,
            error: {
              type: error.constructor.name,
              message: error.message,
              status: error.status || 500,
              response: error.response || null,
            },
            userId: request.user?.id || 'anonymous',
          };
          
          console.log(`❌ Request failed: ${method} ${url} - Error: ${error.message} - Status: ${error.status || 500}`);
          console.log('🔍 Error Details:', JSON.stringify(errorLog, null, 2));
        },
      }),
    );
  }

  private sanitizeData(data: any): any {
    if (!data || typeof data !== 'object') return data;
    
    const sensitiveFields = ['password', 'token', 'authorization', 'secret', 'key'];
    const sanitized = { ...data };
    
    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '***REDACTED***';
      }
    }
    
    return sanitized;
  }

  private sanitizeHeaders(headers: any): any {
    const sanitized = { ...headers };
    const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];
    
    for (const header of sensitiveHeaders) {
      if (sanitized[header]) {
        sanitized[header] = '***REDACTED***';
      }
    }
    
    return {
      'content-type': sanitized['content-type'],
      'user-agent': sanitized['user-agent'],
      'authorization': sanitized['authorization'],
    };
  }
}
