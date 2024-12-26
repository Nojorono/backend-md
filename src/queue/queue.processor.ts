import { Processor, Process } from '@nestjs/bull';
import { CreateMdActivityDto } from '../modules/activity/dtos/activitymd.dtos';

@Processor('activityQueue')
export class QueueProcessor {
  @Process('createActivity')
  async handleCreateActivity(job: any) {
    const data: CreateMdActivityDto = job.data;
    // Implement your processing logic here
    console.log('Processing activity creation:', data);
    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}