import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
// import { Transport } from '@nestjs/microservices';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app/app.module';
import { setupSwagger } from './swagger';
import express, { Request, Response } from 'express';
import helmet from 'helmet';
import * as promClient from 'prom-client';

async function bootstrap() {
  // Initialize Prometheus metrics
  const register = new promClient.Registry();
  promClient.collectDefaultMetrics({ register });

  // Custom metrics
  const httpRequestDuration = new promClient.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.1, 0.5, 1, 2, 5],
  });
  register.registerMetric(httpRequestDuration);

  const httpRequestTotal = new promClient.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code'],
  });
  register.registerMetric(httpRequestTotal);

  // Set timezone to Asia/Jakarta
  process.env.TZ = 'Asia/Jakarta';
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

  // Add metrics endpoint
  expressApp.get('/metrics', async (_req: Request, res: Response) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  });

  // Add monitoring middleware
  expressApp.use((req: Request, res: Response, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      httpRequestDuration.labels(req.method, req.path, res.statusCode.toString()).observe(duration / 1000);
      httpRequestTotal.labels(req.method, req.path, res.statusCode.toString()).inc();
    });
    next();
  });

  expressApp.get('/', (_req: Request, res: Response) => {
    res.status(200).json({
      status: 200,
      message: `Message from ${configService.get('app.name')}`,
      data: {
        timestamp: new Date().toLocaleString('id-ID', {
          timeZone: 'Asia/Jakarta',
        }),
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
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      crossOriginOpenerPolicy: false,
    }),
  );

  app.enableCors({
    origin: [
      'https://md.koneksi.co.id',
      'http://localhost:8080',
      'http://10.0.63.205:8080', 
      'http://127.0.0.1:8080',
      'http://192.168.1.100:8080',
      'http://192.168.0.102:8080',
      'http://192.168.1.102:8080',
      'http://0.0.0.0:8080',
      'exp://192.168.0.102:*',
      'exp://192.168.1.102:*',
      'exp://10.0.63.168:*',
      'http://10.0.63.168:*',
      'http://10.0.63.88:*',
      'http://192.168.0.102:*',
      'http://192.168.1.102:*',
      '*',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Origin',
      'X-Requested-With',
    ],
    exposedHeaders: ['Authorization'],
    credentials: true,
    maxAge: 3600,
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
  
  await app.listen(port, host);
  logger.log(
    `🚀 ${configService.get(
      'app.name',
    )} service started successfully on port ${port}`,
  );
}
bootstrap();
