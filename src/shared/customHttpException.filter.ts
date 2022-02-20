import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';

import { CustomHttpException } from '@app/shared/customHttp.exception';
import { ErrorsFormatInterface } from '@app/shared/errorsFormat.interface';

@Catch(CustomHttpException)
export class CustomHttpExceptionFilter implements ExceptionFilter {
  catch(exception: CustomHttpException, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const reponse = context.getResponse<Response>();
    const status = exception.getStatus();
    const message = exception.getResponse() as string;
    const errorsResponse: ErrorsFormatInterface = {
      errors: { error: [message] }
    };

    reponse.status(status).json(errorsResponse);
  }
}