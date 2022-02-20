import { NestFactory } from '@nestjs/core';
import { AppModule } from '@app/app.module';
import { CustomHttpExceptionFilter } from '@app/shared/customHttpException.filter';

if (!process.env.IS_TS_NODE) {
  require('module-alias/register');
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 3000;

  app.useGlobalFilters(new CustomHttpExceptionFilter());
  await app.listen(port);
}

bootstrap();
