import { Module } from '@nestjs/common';

import { CommentsService } from './service/comments.service';
import { CommonModule } from '../../common/common.module';
import { DrizzleService } from '../../common/services/drizzle.service';
import { UserRepo } from '../user/repository/user.repo';
import { CommentsRepository } from './repository/comments.repository';
import { CommentsControllers } from './controllers/comments.controllers';

@Module({
  controllers: [CommentsControllers],
  imports: [CommonModule],
  providers: [DrizzleService, CommentsService, UserRepo, CommentsRepository],
  exports: [CommentsService, CommentsRepository],
})
export class CommentsModule {}
