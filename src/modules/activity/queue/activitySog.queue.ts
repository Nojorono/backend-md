import { OnWorkerEvent, Processor } from '@nestjs/bullmq';
import { Logger, Injectable, Inject } from '@nestjs/common';
import { Job } from 'bullmq';
import { WorkerHostProcessor } from '../worker/worker.host.processor';
import { ActivitySioService } from '../service/activity.sio.service';
import { ActivitySogService } from '../service/activity.sog.service';

@Injectable()
@Processor('activitySogQueue')
export class ActivitySogQueueProcessor extends WorkerHostProcessor {
  protected readonly logger = new Logger(ActivitySogQueueProcessor.name);

  constructor(
    @Inject(ActivitySogService)
    private readonly activitySogService: ActivitySogService,
  ) {
    super();
  }

  async process(job: Job): Promise<any> {
    const data = job.data;
    await this.activitySogService.createDataSog(data.call_plan_schedule_id, data.createDto);
    return job.data;
  }

  @OnWorkerEvent('active')
  onActive(job: Job) {
    this.logger.log(`Processing job ${job.id} of type ${job.name} with data ${job.data}...`);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Job ${job.id} of type ${job.name} completed`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job) {
    this.logger.error(`Job ${job.id} of type ${job.name} failed with error: ${JSON.stringify(job.failedReason)}`);
  }
}
