import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { APP_FILTER } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import * as OpenApiValidator from 'express-openapi-validator';
import { OpenApiExceptionFilter } from './filters/openapi-exception.filter';
import { join } from 'path';
import { PingController } from './ping/ping.controller';
import { GithubController } from './github/github.controller';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [AppController, PingController, GithubController],
  providers: [
    AppService,
    { provide: APP_FILTER, useClass: OpenApiExceptionFilter },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        ...OpenApiValidator.middleware({
          apiSpec: join(__dirname, './api.yaml'),
          validateRequests: {
            allowUnknownQueryParameters: true,
            coerceTypes: false,
          },
          validateResponses: true,
          validateFormats: 'full',
        }),
      )
      .forRoutes('*');
  }
}
