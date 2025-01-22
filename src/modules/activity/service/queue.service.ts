import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue('activityQueue') private activityQueue: Queue,
    @InjectQueue('activityBranchQueue') private activityBranchQueue: Queue,
    @InjectQueue('activitySogQueue') private activitySogQueue: Queue,
    @InjectQueue('activitySioQueue') private activitySioQueue: Queue,
    @InjectQueue('activityProgramQueue') private activityProgramQueue: Queue,
  ) {
    // Set up event listeners for monitoring queue status
    this.activityQueue.on('waiting', (job) => {
      console.log(`Job ${job.id} is waiting to be processed`);
    });
  }

  // For activity queue
  async addToActivityQueue(createDto: any) {
    try {
      const job = await this.activityQueue.add('activityQueue', createDto, {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      });
      return { id: job.id, name: job.name };
    } catch (error) {
      console.error('Error adding job to queue:', error);
      throw error;
    }
  }

  // For activity branch queue
  async addToActivityBranchQueue(createDto: any) {
    try {
      const job = await this.activityBranchQueue.add(
        'activityBranchQueue',
        createDto,
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 3000,
          },
          removeOnComplete: true,
          removeOnFail: false,
        },
      );
      return { id: job.id, name: job.name };
    } catch (error) {
      console.error('Error adding branch job to queue:', error);
      throw error;
    }
  }

  // For activity SOG queue
  async addToActivitySogQueue(createDto: any) {
    try {
      const job = await this.activitySogQueue.add(
        'activitySogQueue',
        createDto,
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 3000,
          },
          removeOnComplete: true,
          removeOnFail: false,
        },
      );
      return { id: job.id, name: job.name };
    } catch (error) {
      console.error('Error adding SOG job to queue:', error);
      throw error;
    }
  }

  // For activity SIO queue
  async addToActivitySioQueue(createDto: any) {
    try {
      const job = await this.activitySioQueue.add(
        'activitySioQueue',
        createDto,
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 3000,
          },
          removeOnComplete: true,
          removeOnFail: false,
        },
      );
      return { id: job.id, name: job.name };
    } catch (error) {
      console.error('Error adding SIO job to queue:', error);
      throw error;
    }
  }

  // For activity program queue
  async addToActivityProgramQueue(createDto: any) {
    try {
      const job = await this.activityProgramQueue.add(
        'activityProgramQueue',
        createDto,
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 3000,
          },
          removeOnComplete: true,
          removeOnFail: false,
        },
      );
      return { id: job.id, name: job.name };
    } catch (error) {
      console.error('Error adding program job to queue:', error);
      throw error;
    }
  }
}
