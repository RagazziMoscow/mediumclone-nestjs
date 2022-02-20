import { ArgumentMetadata, HttpException, HttpStatus, Injectable, PipeTransform } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { ErrorsFormatInterface } from '@app/shared/errorsFormat.interface';

@Injectable()
export class CustomValidationPipe implements PipeTransform {
  async transform(value: any, metadata: ArgumentMetadata) {
    const object = plainToClass(metadata.metatype, value);
    const errors: ValidationError[] = await validate(object);

    if (errors.length === 0) {
      return value;
    }

    throw new HttpException(this.formatErrors(errors), HttpStatus.UNPROCESSABLE_ENTITY);
  }

  private formatErrors(errors: ValidationError[]): ErrorsFormatInterface {
    const formattedErrors = errors.reduce((acc: Record<string, string[]>, err: ValidationError) => {
      acc[err.property] = Object.values(err.constraints);
      return acc;
    }, {});

    return { errors: formattedErrors };
  }
}
