import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { QueueService } from './queue.service';
import { QueueProcessor } from './queue.processor';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: 'localhost',
        port: 6379,
        password: 'master123',
      },
    }),
    BullModule.registerQueue({
      name: 'activityQueue',
    }),
    BullModule.registerQueue({
      name: 'activityBranchQueue',
    }),
    BullModule.registerQueue({
      name: 'activitySogQueue',
    }),
    BullModule.registerQueue({
      name: 'activitySioQueue',
    }),
  ],
  providers: [QueueService, QueueProcessor],
  exports: [QueueService],
})
export class QueueModule {}
