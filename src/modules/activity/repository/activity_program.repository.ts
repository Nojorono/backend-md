import { Injectable } from '@nestjs/common';
import { and, eq, isNull } from 'drizzle-orm';
import { ActivityProgram } from '../../../schema';
import { DrizzleService } from '../../../common/services/drizzle.service';
import { buildSearchQuery, paginate } from '../../../helpers/nojorono.helpers';

@Injectable()
export class ActivityProgramRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async create(createDto: any) {
    const db = this.drizzleService['db'];

    if (!db) {
      throw new Error('Database not initialized');
    }

    return await db.insert(ActivityProgram).values(createDto).returning();
  }

  async update(id: number, updateDto: any) {
    const db = this.drizzleService['db'];
    return await db
      .update(ActivityProgram)
      .set(updateDto)
      .where(eq(ActivityProgram.id, id))
      .execute();
  }

  async getById(id: number) {
    const db = this.drizzleService['db'];

    if (!db) {
      throw new Error('Database not initialized');
    }

    const result = await db.select().from(ActivityProgram).where(eq(ActivityProgram.id, id));
    return result[0];
  }

  async delete(id: number, userBy: string) {
    const db = this.drizzleService['db'];
    if (!db) {
      throw new Error('Database not initialized');
    }
    return await db
      .update(ActivityProgram)
      .set({ deleted_at: new Date(), deleted_by: userBy })
      .where(eq(ActivityProgram.id, id))
      .returning();
  }

  async getAll() {
    const db = this.drizzleService['db'];

    if (!db) {
      throw new Error('Database not initialized');
    }

    const query = await db
      .select()
      .from(ActivityProgram)
      .where(and(isNull(ActivityProgram.deleted_at)));

    const totalRecords = parseInt(query.length) || 0;

    return {
      data: query,
      totalRecords: totalRecords,
    };
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

    const query = db.select().from(ActivityProgram).where(isNull(ActivityProgram.deleted_at));

    // Apply search condition if available
    const searchColumns = ['name'];
    const searchCondition = buildSearchQuery(searchTerm, searchColumns);

    // Apply search condition if available
    if (searchCondition) {
      query.where(searchCondition);
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
