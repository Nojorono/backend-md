import { Controller, Get, Query, Res } from '@nestjs/common';
import { ReportService } from '../service/report.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';


@ApiTags('report')
@Controller({
  version: '1',
  path: '/report',
})
export class ReportControllers {
  constructor(private readonly reportService: ReportService) {}

  @ApiBearerAuth('accessToken')
  @Get('activity')
  async getReportActivity(
    @Query('batch_code') batchCode: string,
    // @Query('date_range') dateRange: { start: string; end: string },
    @Res() res: Response,
  ) {
    const excelBuffer = await this.reportService.getReportActivity(batchCode);
    const date = new Date().toISOString().split('T')[0];
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="activity_report_${date}.xlsx"`,
    );

    res.send(excelBuffer);
  }

  @ApiBearerAuth('accessToken')
  @Get('outlet')
  async getReportOutlet(
    @Query('filter') filter: { area: string; region: string; brand: string; sio_type: string } = { area: '', region: '', brand: '', sio_type: '' },
    @Res() res: Response,
  ) {
    const excelBuffer = await this.reportService.getReportOutlet(filter);

    const date = new Date().toISOString().split('T')[0];
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename="outlet_report_${date}.xlsx"`);
    res.send(excelBuffer);
  }
}
