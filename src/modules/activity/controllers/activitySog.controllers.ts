import {
  Controller,
  Post,
  Body,
  BadRequestException,
  Param,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ActivitySogDto } from '../dtos/activity_sog.dtos';
import { Public } from 'src/decorators/public.decorator';
import { QueueService } from '../service/queue.service';
@ApiTags('activity-sog')
@Controller({
  version: '1',
  path: '/activity-sog',
})
export class ActivitySogControllers {
  constructor(
    private readonly queueService: QueueService,
  ) {}

  @Public()
  @Post(':call_plan_schedule_id')
  async create(
    @Param('call_plan_schedule_id') call_plan_schedule_id: number,
    @Body() createDto: ActivitySogDto,
  ) {
    try {
      return await this.queueService.addToActivitySogQueue({
        call_plan_schedule_id,
        createDto,
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        console.error('Validation failed:', error.message);
      }
      throw error;
    }
  }
}
