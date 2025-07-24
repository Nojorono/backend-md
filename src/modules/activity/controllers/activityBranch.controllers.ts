import {
  Controller,
  Post,
  Body,
  BadRequestException,
  Param,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ActivityBranchDto } from '../dtos/activity_branch.dtos';
import { Public } from 'src/decorators/public.decorator';
import { QueueService } from '../service/queue.service';
@ApiTags('activity-branch')
@Controller({
  version: '1',
  path: '/activity-branch',
})
export class ActivityBranchControllers {
  constructor(private readonly queueService: QueueService) {}

  @Public()
  @Post(':call_plan_schedule_id')
  async create(
    @Param('call_plan_schedule_id') call_plan_schedule_id: number,
    @Body() createDto: ActivityBranchDto,
  ) {
    try {
      const job = await this.queueService.addToActivityBranchQueue({
        call_plan_schedule_id,
        createDto,
      });
      return job;
    } catch (error) {
      if (error instanceof BadRequestException) {
        console.error('Validation failed:', error.message);
      }
      throw error;
    }
  }
}
