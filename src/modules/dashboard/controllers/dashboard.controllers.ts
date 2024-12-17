import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from '../service/dashboard.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('dashboard')
@Controller({
  version: '1',
  path: '/dashboard',
})
export class DashboardControllers {
  constructor(private readonly DashboardService: DashboardService) {}

  @ApiBearerAuth('accessToken')
  @Get('batch-target')
  async getDashboardBatchTarget(@Query('code_batch') codeBatch: string) {
    return this.DashboardService.getDashboardBatchTarget(codeBatch);
  }
}
