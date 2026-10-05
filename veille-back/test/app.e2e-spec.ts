import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from '../src/app.module.js';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    const config = new DocumentBuilder().setTitle('Kanban Board API').setVersion('1.0').build();
    SwaggerModule.setup('api', app, SwaggerModule.createDocument(app, config));
    await app.init();
  });

  it('/api (GET) sert Swagger', () => {
    return request(app.getHttpServer()).get('/api').expect(200);
  });

  afterEach(async () => {
    await app.close();
  });
});
