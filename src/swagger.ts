import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { INestApplication } from '@nestjs/common';
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerModule,
} from '@nestjs/swagger';

export const setupSwagger = async (app: INestApplication) => {
  const configService = app.get(ConfigService);
  const logger = new Logger();

  const docName: string = configService.get<string>('doc.name');
  const docDesc: string = configService.get<string>('doc.description');
  const docVersion: string = configService.get<string>('doc.version');
  const docPrefix: string = configService.get<string>('doc.prefix');
  const docServer: string = configService.get<string>('doc.server');

  const documentBuild = new DocumentBuilder()
    .setTitle(docName)
    .setDescription(docDesc)
    .setVersion(docVersion)
    .addServer(docServer)
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'accessToken',
    )
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'refreshToken',
    )
    .build();

  const document = SwaggerModule.createDocument(app, documentBuild, {
    deepScanRoutes: true,
  });
  const customOptions: SwaggerCustomOptions = {
    swaggerOptions: {
      docExpansion: 'none',
      persistAuthorization: true,
      displayOperationId: true,
      operationsSorter: 'method',
      tagsSorter: 'alpha',
      tryItOutEnabled: true,
      filter: true,
    },
  };
  SwaggerModule.setup(docPrefix, app, document, {
    explorer: true,
    customSiteTitle: docName,
    ...customOptions,
  });
  logger.log(`Docs will serve on ${docPrefix}`, 'NestApplication');
};
