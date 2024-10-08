import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
// import { PrismaService } from 'src/common/services/prisma.service';
import { Public } from 'src/decorators/public.decorator';
import { DrizzleService } from '../common/services/drizzle.service';

@Controller({
  version: VERSION_NEUTRAL,
  path: '/',
})
export class AppController {
  constructor(
    private readonly healthCheckService: HealthCheckService,
    private readonly drizzleService: DrizzleService,
  ) {}

  @Get('/health')
  @HealthCheck()
  @Public()
  public async getHealth() {
    return this.healthCheckService.check([
      () => this.drizzleService.isHealthy(),
    ]);
  }
}
