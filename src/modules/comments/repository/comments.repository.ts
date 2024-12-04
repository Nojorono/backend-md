import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { Comments } from '../../../schema';
import { DrizzleService } from '../../../common/services/drizzle.service';
import { CreateDto, UpdateDto } from '../dtos/comments.dtos';
import {
  decrypt,
  encrypt,
} from '../../../helpers/nojorono.helpers';

@Injectable()
export class CommentsRepository {
  constructor(private readonly drizzleService: DrizzleService) {}
  async decryptId(id: string) {
    const stringId = id.toString();
    return decrypt(stringId);
  }

  async encryptedId(id: number) {
    return encrypt(id.toString());
  }

  async createData(CreateDto: CreateDto) {
    const db = this.drizzleService['db'];

    if (!db) {
      throw new Error('Database not initialized');
    }

    return await db
      .insert(Comments)
      .values({
        ...CreateDto,
      })
      .returning();
  }

  async updateData(id: number, UpdateDto: UpdateDto) {
    const db = this.drizzleService['db'];
    return await db
      .update(Comments)
      .set({ ...UpdateDto })
      .where(eq(Comments.id, id))
      .execute();
  }
  
  async getById(id: string) {
    const db = this.drizzleService['db'];
    if (!db) {
      throw new Error('Database not initialized');
    }
    const idDecrypted = await this.decryptId(id);
    const result = await db
      .select()
      .from(Comments)
      .where(eq(Comments.id, idDecrypted));
    return result[0];
  }

  async deleteById(id: number, userEmail: string) {
    const db = this.drizzleService['db'];

    if (!db) {
      throw new Error('Database not initialized');
    }

    return await db
      .update(Comments)
      .set({ deleted_at: new Date(), deleted_by: userEmail })
      .where(eq(Comments.id, id))
      .returning();
  }

  
  async getAll(
    activityId: number,
  ) {
    const db = this.drizzleService['db'];

    if (!db) {
      throw new Error('Database not initialized');
    }

    const query = db.select().from(Comments).where(eq(Comments.activity_id, activityId));

    const result = await query;

    return {
      data: result,
    };
  }
}
