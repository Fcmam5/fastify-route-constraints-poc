import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { HttpExceptionFilter } from 'nest-problem-details-filter';
import { VersioningType } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  app
    .enableVersioning({
      type: VersioningType.HEADER,
      header: 'Accept-Version',
    })
    .useGlobalFilters(new HttpExceptionFilter());

  await app.listen(3000);
}
bootstrap();
