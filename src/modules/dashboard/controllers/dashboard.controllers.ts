import { Controller, Get, Param, Query } from '@nestjs/common';
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
  @Get('outlet-distribution')
  async getOutletDistribution() {
    return this.DashboardService.getOutletDistribution();
  }

  @ApiBearerAuth('accessToken')
  @Get('time-motion')
  async getTimeMotion() {
    return this.DashboardService.getTimeMotion();
  }

  @ApiBearerAuth('accessToken')
  @Get('batch-target')
  async getDashboardBatchTarget(@Query('code_batch') codeBatch: string) {
    return this.DashboardService.getDashboardBatchTarget(codeBatch);
  }

  @ApiBearerAuth('accessToken')
  @Get('outlet')
  async getOutletByFilter(
    @Query('filter')
    filter: {
      area: string;
      region: string;
      brand: string;
      sio_type: string;
    } = { area: '', region: '', brand: '', sio_type: '' },
  ) {
    return this.DashboardService.getOutletByFilter(filter);
  }

  @ApiBearerAuth('accessToken')
  @Get('md-dashboard')
  async getMdDashboard(@Query('user_id') user_id: string) {
    return this.DashboardService.getMdDashboard(user_id);
  }
}
