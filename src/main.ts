import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
// import { Transport } from '@nestjs/microservices';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app/app.module';
import { setupSwagger } from './swagger';
import express, { Request, Response } from 'express';
import helmet from 'helmet';

async function bootstrap() {
  const logger = new Logger();
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(express()),
    {
      cors: true,
    },
  );
  app.useLogger(['error', 'warn', 'log', 'debug', 'verbose']);
  const configService = app.get(ConfigService);
  const expressApp = app.getHttpAdapter().getInstance();
  const port: number = configService.get<number>('app.http.port');
  const host: string = configService.get<string>('app.http.host');
  const globalPrefix: string = configService.get<string>('app.globalPrefix');
  const versioningPrefix: string = configService.get<string>(
    'app.versioning.prefix',
  );
  const version: string = configService.get<string>('app.versioning.version');
  const versionEnable: string = configService.get<string>(
    'app.versioning.enable',
  );

  expressApp.get('/', (_req: Request, res: Response) => {
    res.status(200).json({
      status: 200,
      message: `Message from ${configService.get('app.name')}`,
      data: {
        timestamp: new Date(),
      },
    });
  });

  // Move helmet after WebSocket setup to avoid interfering with WS upgrade
  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix(globalPrefix);
  if (versionEnable) {
    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: version,
      prefix: versioningPrefix,
    });
  }
  await setupSwagger(app);
  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: false,
  }));

  app.enableCors({
    origin: [
      'http://localhost:8080',
      'http://10.0.63.205:8080',
      'http://127.0.0.1:8080',
      'http://192.168.1.100:8080', // Add your local network IP
      'http://0.0.0.0:8080'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
    exposedHeaders: ['Authorization'],
    credentials: true,
    maxAge: 3600
  });
  // app.connectMicroservice({
  //   transport: Transport.RMQ,
  //   options: {
  //     urls: [`${configService.get('rmq.uri')}`],
  //     queue: `${configService.get('rmq.auth')}`,
  //     queueOptions: { durable: false },
  //     prefetchCount: 1,
  //   },
  // });
  // await app.startAllMicroservices();
  await app.listen(port, '0.0.0.0');
  logger.log(
    `🚀 ${configService.get(
      'app.name',
    )} service started successfully on port ${port}`,
  );
}
bootstrap();
