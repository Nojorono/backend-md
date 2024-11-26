import { Injectable } from '@nestjs/common';
import { eq, inArray, isNull } from 'drizzle-orm';
import { Survey } from '../../../schema';
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
  async getById(id: string) {
    const db = this.drizzleService['db'];
    if (!db) {
      throw new Error('Database not initialized');
    }
    const idDecrypted = await this.decryptId(id);
    const result = await db
      .select()
      .from(Survey)
      .where(eq(Survey.id, idDecrypted));
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

  async getAll(
    page: number = 1,
    limit: number = 10,
    searchTerm: string = '',
    filter: { area: string[]; region: string },
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
    if (Array.isArray(filter.area) && filter.area.length > 0) {
      query.where(inArray(Survey.area, filter.area));
    }

    // Apply search condition if available
    const searchColumns = ['region', 'outlet_code', 'area'];
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

    const encryptedResult = await Promise.all(
      result.map(async (item) => {
        const encryptedId = await this.encryptedId(item.id);

        return {
          ...item,
          id: encryptedId,
        };
      }),
    );

    return {
      data: encryptedResult,
      ...paginate(totalRecords, page, limit),
    };
  }
}
