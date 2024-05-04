import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, Logger } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';

describe('.enableVersioning() [With no params, uses URI by default]', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );

    app.enableVersioning();

    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  describe('it should not log a warning, and', () => {
    let logWarnSpy;

    beforeEach(() => {
      logWarnSpy = jest.spyOn(Logger, 'warn');
    });

    afterAll(() => {
      jest.resetAllMocks();
    });

    it('should return a 404 for /greet', async () => {
      await request(app.getHttpServer()).get('/greet ').expect(404);

      expect(logWarnSpy).not.toHaveBeenCalled();
    });

    it('should return a 200 for /v1/greet', async () => {
      await request(app.getHttpServer())
        .get('/v1/greet ')
        .expect(200)
        .expect({ msg: 'Hello world!', version: 'v1' });

      expect(logWarnSpy).not.toHaveBeenCalled();
    });
  });
});
