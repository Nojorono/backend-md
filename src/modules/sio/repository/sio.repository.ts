import { Injectable } from '@nestjs/common';
import { and, eq, isNull } from 'drizzle-orm';
import { MSioType } from '../../../schema';
import { DrizzleService } from '../../../common/services/drizzle.service';
import { buildSearchQuery, paginate } from '../../../helpers/nojorono.helpers';
import { CreateSioDto, UpdateSioDto } from '../dtos/sio.dtos';

@Injectable()
export class SioRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async create(createDto: CreateSioDto) {
    const db = this.drizzleService['db'];

    if (!db) {
      throw new Error('Database not initialized');
    }

    return await db.insert(MSioType).values(createDto).returning();
  }

  async update(id: number, updateDto: UpdateSioDto) {
    const db = this.drizzleService['db'];
    return await db
      .update(MSioType)
      .set(updateDto)
      .where(eq(MSioType.id, id))
      .execute();
  }

  async getById(id: number) {
    const db = this.drizzleService['db'];

    if (!db) {
      throw new Error('Database not initialized');
    }

    const result = await db.select().from(MSioType).where(eq(MSioType.id, id));
    return result[0]; // Return the first (and expectedly only) result
  }

  async delete(id: number, userBy: string) {
    const db = this.drizzleService['db'];
    if (!db) {
      throw new Error('Database not initialized');
    }
    return await db
      .update(MSioType)
      .set({ deleted_at: new Date(), deleted_by: userBy })
      .where(eq(MSioType.id, id))
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

    const query = db.select().from(MSioType).where(isNull(MSioType.deleted_at));

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

  async getAll() {
    const db = this.drizzleService['db'];

    if (!db) {
      throw new Error('Database not initialized');
    }

    const query = await db
      .select()
      .from(MSioType)
      .where(and(isNull(MSioType.deleted_at)));

    const totalRecords = parseInt(query.length) || 0;

    return {
      data: query,
      totalRecords: totalRecords,
    };
  }
}
