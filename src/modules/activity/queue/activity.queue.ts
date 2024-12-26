import { Processor, Process } from '@nestjs/bull';
import { CreateMdActivityDto } from '../dtos/activitymd.dtos';
import { ActivityService } from '../service/activity.service';

@Processor('activityQueue')
export class ActivityQueueProcessor {
  constructor(private readonly activityService: ActivityService) {}

  @Process('createActivity')
  async createActivity(job: any) {
    const data: CreateMdActivityDto = job.data;
    try {
      console.log('Processing activity creation:', data);
      const result = await this.activityService.createDataActivity(data);
      console.log('Result from database insertion:', result);
    } catch (error) {
      console.error('Error processing job:', error);
      throw error;
    }
  }
}