import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { Comments, Notifications, mUser } from '../../../schema';
import { DrizzleService } from '../../../common/services/drizzle.service';
import { CreateDto, UpdateDto } from '../dtos/notifications.dtos';
import {
  decrypt,
  encrypt,
} from '../../../helpers/nojorono.helpers';

@Injectable()
export class NotificationsRepository {
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
    const user_id = await this.decryptId(CreateDto.user_id);

    if (!db) {
      throw new Error('Database not initialized');
    }

    return await db
      .insert(Notifications)
      .values({
        ...CreateDto,
        user_id: user_id,
      })
      .returning();
  }

  async updateData(id: number, UpdateDto: UpdateDto) {
    const db = this.drizzleService['db'];
    return await db
      .update(Notifications)
      .set({ ...UpdateDto })
      .where(eq(Notifications.id, id))
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
      .from(Notifications)
      .where(eq(Notifications.id, idDecrypted));
    return result[0];
  }

  async getByActivityId(id: number) {
    const db = this.drizzleService['db'];
    if (!db) {
      throw new Error('Database not initialized');
    }
    return await db.select({  
      ...Notifications
    }).from(Notifications).where(eq(Notifications.user_id, id));
  }

  async deleteById(id: number, userEmail: string) {
    const db = this.drizzleService['db'];

    if (!db) {
      throw new Error('Database not initialized');
    }

    return await db
      .update(Notifications)
      .set({ deleted_at: new Date(), deleted_by: userEmail })
      .where(eq(Notifications.id, id))
      .returning();
  }

  
  async getAll(
    userId: number,
  ) {
    const db = this.drizzleService['db'];

    if (!db) {
      throw new Error('Database not initialized');
    }

    const query = db.select().from(Notifications).where(eq(Notifications.user_id, userId));

    const result = await query;

    return {
      data: result,
    };
  }
}
