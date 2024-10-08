import configs from '../config';
import { Module } from '@nestjs/common';
// import { PrismaService } from './services/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { DrizzleService } from './services/drizzle.service';

@Module({
  controllers: [],
  imports: [
    ConfigModule.forRoot({
      load: configs,
      isGlobal: true,
      cache: true,
      envFilePath: ['.env'],
      expandVariables: true,
    }),
  ],
  providers: [DrizzleService],
  exports: [DrizzleService],
})
export class CommonModule {}
