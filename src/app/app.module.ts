import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { join } from 'path';
import { TerminusModule } from '@nestjs/terminus';
import { AcceptLanguageResolver, I18nModule, QueryResolver } from 'nestjs-i18n';
import { AuthJwtAccessGuard } from 'src/guards/jwt.access.guard';
import { PassportModule } from '@nestjs/passport';
import { AppController } from './app.controller';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ResponseInterceptor } from 'src/interceptors/response.interceptor';
import { GlobalExceptionFilter } from 'src/interceptors/exception.interceptor';
import { LoggingMiddleware } from '../middlewares/logging.middleware';
import { CommonModule } from '../common/common.module';
// import { PermissionsGuard } from '../guards/permission.guard';
import { UserModule } from '../modules/user/user.module';
import { AuthModule } from '../modules/auth/auth.module';
import { OutletModule } from '../modules/outlet/outlet.module';
import { RolesModule } from '../modules/roles/roles.module';
import { CallPlanModule } from '../modules/callplan/callplan.module';
import { BatchModule } from '../modules/batch/batch.module';
import { S3Module } from '../modules/s3/s3.module';
import { BrandModule } from '../modules/brand/brand.module';

@Module({
  imports: [
    CommonModule, // add new module
    S3Module, // add new module
    AuthModule, // add new module
    BatchModule, // add new module
    UserModule, // add new module
    OutletModule, // add new module
    RolesModule, // add new module
    CallPlanModule, // add new module
    BrandModule, // add new module
    PassportModule.register({ defaultStrategy: 'jwt' }),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: join(__dirname, '../i18n/'),
        watch: true,
      },
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
      ],
    }),
    TerminusModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: AuthJwtAccessGuard,
    },
    // {
    //   provide: APP_GUARD,
    //   useClass: PermissionsGuard,
    // },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
