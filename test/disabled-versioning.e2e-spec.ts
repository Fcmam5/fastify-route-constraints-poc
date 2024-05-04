import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, Logger } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';

describe('Disabled versioning [enableVersioning() is not called in main.ts]', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  it('should log a warning', async () => {
    const logWarnSpy = jest.spyOn(Logger, 'warn');

    await request(app.getHttpServer())
      .get('/greet ')
      .expect(200)
      .expect({ msg: 'Hello world!', version: 'v1' });

    expect(logWarnSpy).toHaveBeenCalledWith(
      'Versioning must be enabled to use this functionality! See: https://docs.nestjs.com/techniques/versioning',
    );
  });
});
