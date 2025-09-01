import { HttpException, HttpStatus } from '@nestjs/common';

export class TokenMissingException extends HttpException {
  constructor() {
    super(
      {
        error: 'TOKEN_MISSING',
        message: 'Authentication token is required',
        statusCode: HttpStatus.UNAUTHORIZED,
      },
      HttpStatus.UNAUTHORIZED,
    );
  }
}

export class TokenInvalidException extends HttpException {
  constructor(message?: string) {
    super(
      {
        error: 'TOKEN_INVALID',
        message: message || 'Authentication token is invalid or expired',
        statusCode: HttpStatus.UNAUTHORIZED,
      },
      HttpStatus.UNAUTHORIZED,
    );
  }
}

export class InsufficientPermissionsException extends HttpException {
  constructor(requiredRoles?: string[]) {
    const roleMessage = requiredRoles?.length 
      ? ` Required roles: ${requiredRoles.join(', ')}`
      : '';
    
    super(
      {
        error: 'INSUFFICIENT_PERMISSIONS',
        message: `You don't have sufficient permissions to access this resource.${roleMessage}`,
        statusCode: HttpStatus.FORBIDDEN,
      },
      HttpStatus.FORBIDDEN,
    );
  }
}

export class ResourceAccessDeniedException extends HttpException {
  constructor(resource?: string) {
    const resourceMessage = resource ? ` for ${resource}` : '';
    
    super(
      {
        error: 'RESOURCE_ACCESS_DENIED',
        message: `Access denied${resourceMessage}`,
        statusCode: HttpStatus.FORBIDDEN,
      },
      HttpStatus.FORBIDDEN,
    );
  }
}
