import { OnWorkerEvent, Processor } from '@nestjs/bullmq';
import { Logger, Injectable, Inject } from '@nestjs/common';
import { Job } from 'bullmq';
import { ActivityService } from '../service/activity.service';
import { WorkerHostProcessor } from '../worker/worker.host.processor';

@Injectable()
@Processor('activityQueue')
export class ActivityQueueProcessor extends WorkerHostProcessor {
  protected readonly logger = new Logger(ActivityQueueProcessor.name);

  constructor(
    @Inject(ActivityService)
    private readonly activityService: ActivityService,
  ) {
    super();
  }

  async process(job: Job): Promise<any> {
    const data = job.data;
    await this.activityService.createDataActivity(data);
    return job.data;
  }

  @OnWorkerEvent('active')
  onActive(job: Job) {
    this.logger.log(`Processing job ${job.id} of type ${job.name} with data ${job.data}...`);
  }

  @OnWorkerEvent('completed')
  async onCompleted(job: Job) {
    this.logger.log(`Job ${job.id} of type ${job.name} completed`);
    // await job.remove();
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job) {
    this.logger.error(`Job ${job.id} of type ${job.name} failed with error: ${JSON.stringify(job.failedReason)}`);
  }
}
