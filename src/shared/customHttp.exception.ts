import { HttpException } from '@nestjs/common';

export class CustomHttpException extends HttpException {
  constructor(response: string, status: number) {
    super(response, status);
  }
}
