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
    @Res() res: Response,
  ) {
    try {
      // Validate batchCode
      if (!batchCode) {
        return res.status(400).json({ message: 'Batch code is required.' });
      }
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
    } catch (error) {
      console.error('Error generating report:', error);
      return res.status(500).json({ message: 'Internal server error.' });
    }
  }

  @ApiBearerAuth('accessToken')
  @Get('outlet')
  async getReportOutlet(
    @Query('filter')
    filter: {
      area: string;
      region: string;
      brand: string;
      sio_type: string;
    } = { area: '', region: '', brand: '', sio_type: '' },
    @Res() res: Response,
  ) {
    try {
      // Set a longer timeout for the response to prevent timeouts on large datasets
      res.setTimeout(600000); // 5 minutes timeout

      console.log('Starting outlet report generation with filters:', filter);
      const excelBuffer = await this.reportService.getReportOutlet(filter);
      console.log('Report generation completed, size:', excelBuffer.length);

      const date = new Date().toISOString().split('T')[0];
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="outlet_report_${date}.xlsx"`,
      );
      // Set no-cache headers to ensure the file is always downloaded fresh
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      
      res.send(excelBuffer);
    } catch (error) {
      console.error('Error generating outlet report:', error);
      return res.status(500).json({ message: 'Internal server error.' });
    }
  }

  @ApiBearerAuth('accessToken')
  @Get('reimbursement')
  async getReportReimbursement(
    @Query('filter') filter: { area: string, region: string } = { area: '', region: '' },
    @Res() res: Response,
  ) {
    try {
      // Set a longer timeout for the response to prevent timeouts on large datasets
      res.setTimeout(600000); // 5 minutes timeout

      console.log('Starting reimbursement report generation with filters:', filter);
      const excelBuffer = await this.reportService.getReportReimbursement(filter);
      console.log('Report generation completed, size:', excelBuffer.length);

      const date = new Date().toISOString().split('T')[0];
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader('Content-Disposition', `attachment; filename="reimbursement_report_${date}.xlsx"`);
      // Set no-cache headers to ensure the file is always downloaded fresh
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      
      res.send(excelBuffer);
    } catch (error) {
      console.error('Error generating reimbursement report:', error);
      return res.status(500).json({ message: 'Internal server error.' });
    }
  }

  @ApiBearerAuth('accessToken')
  @Get('absent')
  async getReportAbsent(
    @Query('filter') filter: { area: string, region: string } = { area: '', region: '' },
    @Res() res: Response,
  ) {
    try {
      // Set a longer timeout for the response to prevent timeouts on large datasets
      res.setTimeout(600000); // 5 minutes timeout

      console.log('Starting absent report generation with filters:', filter);
      const excelBuffer = await this.reportService.getReportAbsent(filter);
      console.log('Report generation completed, size:', excelBuffer.length);

      const date = new Date().toISOString().split('T')[0];
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader('Content-Disposition', `attachment; filename="absent_report_${date}.xlsx"`);
      // Set no-cache headers to ensure the file is always downloaded fresh
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      
      res.send(excelBuffer);
    } catch (error) {
      console.error('Error generating absent report:', error);
      return res.status(500).json({ message: 'Internal server error.' });
    }
  }
}
