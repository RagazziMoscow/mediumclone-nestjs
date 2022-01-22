import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

if (!process.env.IS_TS_NODE) {
  require('module-alias/register');
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 3000;

  await app.listen(port);
}
bootstrap();
