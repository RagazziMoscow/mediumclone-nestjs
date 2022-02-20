import { CanActivate, ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';

import { ExpressRequestInterface } from '@app/types/expressRequest.interface';
import { CustomHttpException } from '@app/shared/customHttp.exception';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const request = ctx.switchToHttp().getRequest<ExpressRequestInterface>();

    if (request.user) {
      return true;
    }

    throw new CustomHttpException(
      'Not authorized',
      HttpStatus.UNAUTHORIZED
    );
  }
}