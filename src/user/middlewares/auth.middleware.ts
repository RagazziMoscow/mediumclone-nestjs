import { Injectable, NestMiddleware } from '@nestjs/common';
import { ExpressRequestInterface } from '@app/types/expressRequest.interface';
import { NextFunction, Response } from 'express';
import { verify } from 'jsonwebtoken';

import { UserService } from '@app/user/user.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly userService: UserService) {}

  async use(req: ExpressRequestInterface, res: Response, next: NextFunction) {
    if (!req.headers.authorization) {
      req.user = null;
      next();
      return;
    }

    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = verify(token, process.env.JWT_SECRET) as any;
      const user = await this.userService.findById(decoded.id);

      req.user = user;
      next();
    } catch (err) {
      req.user = null;
      next();
    }
  }
}