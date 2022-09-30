import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { APP_FILTER } from '@nestjs/core';
import * as OpenApiValidator from 'express-openapi-validator';
import { OpenApiExceptionFilter } from './filters/openapi-exception.filter';
import { join } from 'path';
import { PingController } from './ping/ping.controller';

@Module({
  imports: [],
  controllers: [AppController, PingController],
  providers: [AppService, { provide: APP_FILTER, useClass: OpenApiExceptionFilter }],
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
