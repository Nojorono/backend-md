import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { CreateMdActivityDto } from '../modules/activity/dtos/activitymd.dtos';

@Injectable()
export class QueueService {
  constructor(@InjectQueue('activityQueue') private activityQueue: Queue) {}

  async addToQueue(createDto: CreateMdActivityDto) {
    await this.activityQueue.add('createActivity', createDto);
  }
}