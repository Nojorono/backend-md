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
import { ProgramModule } from '../modules/program/program.module';
import { ActivityModule } from '../modules/activity/activity.module';
import { SioModule } from '../modules/sio/sio.module';
import { RegionAreaModule } from '../modules/regionarea/regionarea.module';
import { SurveyModule } from '../modules/survey/survey.module';
import { ConfigModule } from '@nestjs/config';
import { SocketModule } from 'src/socket/socket.module';
import { CommentsModule } from 'src/modules/comments/comments.module';
import { NotificationsModule } from 'src/modules/notifications/notifications.module';
import { AbsensiModule } from 'src/modules/absensi/absensi.module';
import { DashboardModule } from 'src/modules/dashboard/dashboard.module';
import { ReportModule } from 'src/modules/report/report.module';
import { ReimburseBbmModule } from 'src/modules/reimburseBbm/reimburseBbm.module';

@Module({
  imports: [
    ConfigModule.forRoot({ // Load environment variables
      isGlobal: true,
    }),
    SocketModule,
    CommonModule,
    S3Module,
    AuthModule,
    BatchModule,
    UserModule,
    OutletModule,
    RolesModule,
    CallPlanModule,
    BrandModule,
    ActivityModule,
    SioModule,
    RegionAreaModule,
    SurveyModule,
    CommentsModule,
    NotificationsModule,
    ProgramModule,
    AbsensiModule,
    DashboardModule,
    ReimburseBbmModule,
    ReportModule,
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
