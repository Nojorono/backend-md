import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { CreateMdActivityDto } from '../dtos/activitymd.dtos';
import { ActivityBranchDto } from '../dtos/activity_branch.dtos';
import { ActivitySogDto } from '../dtos/activity_sog.dtos';
import { ActivitySioDto } from '../dtos/activity_sio.dtos';

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue('activityQueue') private activityQueue: Queue,
    @InjectQueue('activityBranchQueue') private activityBranchQueue: Queue,
    @InjectQueue('activitySogQueue') private activitySogQueue: Queue,
    @InjectQueue('activitySioQueue') private activitySioQueue: Queue,
  ) {
    // Set up event listeners for monitoring queue status
    this.activityQueue.on('waiting', (job) => {
      console.log(`Job ${job.id} is waiting to be processed`);
    });
  }
  
  // For activity queue
  async addToActivityQueue(createDto: CreateMdActivityDto) {
    try {
      const job = await this.activityQueue.add('createActivity', createDto, {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: true
      });
      console.log('Job added to queue:', job.id);
      return { id: job.id, name: job.name };
    } catch (error) {
      console.error('Error adding job to queue:', error);
      throw error;
    }
  }

  // For activity branch queue
  async addToActivityBranchQueue(createDto: ActivityBranchDto) {
    try {
      const job = await this.activityBranchQueue.add('createActivityBranch', createDto, {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: true
      });
      return { id: job.id, name: job.name };
    } catch (error) {
      console.error('Error adding branch job to queue:', error);
      throw error;
    }
  }

  // For activity SOG queue
  async addToActivitySogQueue(createDto: ActivitySogDto) {
    try {
      const job = await this.activitySogQueue.add('createActivitySog', createDto, {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: true
      });
      return { id: job.id, name: job.name };
    } catch (error) {
      console.error('Error adding SOG job to queue:', error);
      throw error;
    }
  }

  // For activity SIO queue
  async addToActivitySioQueue(createDto: ActivitySioDto) {
    try {
      const job = await this.activitySioQueue.add('createActivitySio', createDto, {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: true
      });
      return { id: job.id, name: job.name };
    } catch (error) {
      console.error('Error adding SIO job to queue:', error);
      throw error;
    }
  }
}
