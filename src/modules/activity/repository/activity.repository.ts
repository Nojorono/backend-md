import { Injectable } from '@nestjs/common';
import { eq, isNull } from 'drizzle-orm';
import { Activity } from '../../../schema';
import { DrizzleService } from '../../../common/services/drizzle.service';
import { buildSearchQuery, paginate } from '../../../helpers/nojorono.helpers';
import {
  CreateMdActivityDto,
  UpdateMdActivityDto,
} from '../dtos/activitymd.dtos';

@Injectable()
export class ActivityRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async create(createDto: CreateMdActivityDto) {
    const db = this.drizzleService['db'];

    if (!db) {
      throw new Error('Database not initialized');
    }
    console.log(createDto);

    return await db.insert(Activity).values(createDto).returning();
  }

  async update(id: number, updateDto: UpdateMdActivityDto) {
    const db = this.drizzleService['db'];
    return await db
      .update(Activity)
      .set(updateDto)
      .where(eq(Activity.id, id))
      .execute();
  }

  async getById(id: number) {
    const db = this.drizzleService['db'];

    if (!db) {
      throw new Error('Database not initialized');
    }

    const result = await db.select().from(Activity).where(eq(Activity.id, id));
    return result[0]; // Return the first (and expectedly only) result
  }

  async delete(id: number, userBy: string) {
    const db = this.drizzleService['db'];
    if (!db) {
      throw new Error('Database not initialized');
    }
    return await db
      .update(Activity)
      .set({ deleted_at: new Date(), deleted_by: userBy })
      .where(eq(Activity.id, id))
      .returning();
  }

  async getAllActive(
    page: number = 1,
    limit: number = 10,
    searchTerm: string = '',
  ) {
    const db = this.drizzleService['db'];

    if (!db) {
      throw new Error('Database not initialized');
    }

    const query = db.select().from(Activity).where(isNull(Activity.deleted_at));
    // Apply search condition if available
    if (searchTerm !== '') {
      console.log(searchTerm);
      const searchColumns = ['area', 'region'];
      const searchCondition = buildSearchQuery(searchTerm, searchColumns);
      if (searchCondition) {
        query.where(searchCondition);
      }
    }
    const records = await query.execute();
    const totalRecords = parseInt(records.length) || 0;
    const { offset } = paginate(totalRecords, page, limit);
    query.limit(limit).offset(offset);

    const result = await query;

    return {
      data: result,
      ...paginate(totalRecords, page, limit),
    };
  }
}