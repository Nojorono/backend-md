import { Injectable } from '@nestjs/common';
import { and, eq, inArray, isNull } from 'drizzle-orm';
import { mOutlets, Survey } from '../../../schema';
import { DrizzleService } from '../../../common/services/drizzle.service';
import { CreateDto, UpdateDto } from '../dtos/survey.dtos';
import {
  buildSearchQuery,
  decrypt,
  encrypt,
  paginate,
} from '../../../helpers/nojorono.helpers';

@Injectable()
export class SurveyRepository {
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
      .insert(Survey)
      .values({
        ...CreateDto,
      })
      .returning();
  }
  async updateData(id: number, UpdateDto: UpdateDto) {
    const db = this.drizzleService['db'];
    return await db
      .update(Survey)
      .set({ ...UpdateDto })
      .where(eq(Survey.id, id))
      .execute();
  }
  async getById(id: number) {
    const db = this.drizzleService['db'];
    if (!db) {
      throw new Error('Database not initialized');
    }
    const result = await db
      .select({
        ...Survey,
        outlet: mOutlets,
      })
      .from(Survey)
      .innerJoin(mOutlets, eq(Survey.outlet_id, mOutlets.id))
      .where(eq(Survey.id, id));
    return result[0];
  }
  // Delete an outlet (soft delete by updating is_deleted field)
  async deleteById(id: number, userEmail: string) {
    const db = this.drizzleService['db'];

    if (!db) {
      throw new Error('Database not initialized');
    }

    return await db
      .update(Survey)
      .set({ deleted_at: new Date(), deleted_by: userEmail })
      .where(eq(Survey.id, id))
      .returning();
  }

  async getSchedule(area: string, region: string) {
    const db = this.drizzleService['db'];

    if (!db) {
      throw new Error('Database not initialized');
    }

    const conditions = [
      isNull(Survey.deleted_at),
      eq(Survey.is_approved, 0)
    ];

    // Apply region filter if provided
    if (region) {
      conditions.push(eq(Survey.region, region));
    }

    // Apply area filter if provided 
    if (area) {
      conditions.push(eq(Survey.area, area));
    }

    const query = db
      .select()
      .from(Survey)
      .where(and(...conditions));

    return await query.execute();
  }

  async getAll(
    page: number = 1,
    limit: number = 10,
    searchTerm: string = '',
    isActive: string = '',
    filter: { area: string; region: string; brand: string; sio_type: string },
  ) {
    const db = this.drizzleService['db'];

    if (!db) {
      throw new Error('Database not initialized');
    }

    const query = db.select().from(Survey).where(isNull(Survey.deleted_at));

    // Apply region filter if provided
    if (filter.region) {
      query.where(eq(Survey.region, filter.region));
    }

    // Apply area filter if provided (assuming 'area' is an array in filter)
    if (filter.area) {
      query.where(eq(Survey.area, filter.area));
    }

    if (filter.brand) {
      query.where(eq(Survey.brand, filter.brand));
    }

    if (filter.sio_type) {
      query.where(eq(Survey.sio_type, filter.sio_type));
    }

    // Apply search condition if available
    const searchColumns = ['name', 'outlet_code', 'address_line'];
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
