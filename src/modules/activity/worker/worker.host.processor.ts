// worker-host.process.ts

import { OnWorkerEvent, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

export abstract class WorkerHostProcessor extends WorkerHost {
  protected readonly logger = new Logger(WorkerHostProcessor.name);

  @OnWorkerEvent('completed')
  onCompleted(job: Job<any>) {
    const { id, name, queueName, finishedOn, returnvalue } = job;
    const completionTime = finishedOn ? new Date(finishedOn).toISOString() : '';
    console.log(
        `Job id: ${id}, name: ${name} completed in queue ${queueName} on ${completionTime}. Result: ${returnvalue}`,
      );
    this.logger.log(
      `Job id: ${id}, name: ${name} completed in queue ${queueName} on ${completionTime}. Result: ${returnvalue}`,
    );
  }

  @OnWorkerEvent('progress') 
  onProgress(job: Job<any>) {
    const { id, name, progress } = job;
    console.log(`Job id: ${id}, name: ${name} completes ${progress}%`);
    this.logger.log(`Job id: ${id}, name: ${name} completes ${progress}%`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<any>) {
    const { id, name, queueName, failedReason } = job;
    console.error(`Job id: ${id}, name: ${name} failed in queue ${queueName}. Failed reason: ${failedReason}`);
    this.logger.error(`Job id: ${id}, name: ${name} failed in queue ${queueName}. Failed reason: ${failedReason}`);
  }

  @OnWorkerEvent('active')
  onActive(job: Job<any>) {
    const { id, name, queueName, timestamp } = job;
    const startTime = timestamp ? new Date(timestamp).toISOString() : '';
    console.log(`Job id: ${id}, name: ${name} starts in queue ${queueName} on ${startTime}.`);
    this.logger.log(`Job id: ${id}, name: ${name} starts in queue ${queueName} on ${startTime}.`);
  }
}