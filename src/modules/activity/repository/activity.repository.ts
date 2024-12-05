import { Injectable } from '@nestjs/common';
import { eq, isNull } from 'drizzle-orm';
import { Activity, mOutlets } from '../../../schema';
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

    const activityWithRelations = await db.query.Activity.findFirst({
      where: (Activity, { eq }) => eq(Activity.id, id),
      with: {
        callPlanSchedule: true,
        surveyOutlet: true,
        outlet: true,
        user: true,
        callPlan: true,
        activitySios: true,
        activitySogs: true,
      },
    });

    return activityWithRelations;
  }

  async getRegionAndArea(id: number) {
    const db = this.drizzleService['db'];

    if (!db) {
      throw new Error('Database not initialized');
    }

    const data = await db.query.Activity.findFirst({
      where: (Activity, { eq }) => eq(Activity.id, id),
      columns: {
        region: true,
        area: true,
      },
    });

    return data;
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

    const query = db.select({
      ...Activity,
      outlet_name: mOutlets.name,
    }).from(Activity).leftJoin(mOutlets, eq(Activity.outlet_id, mOutlets.id)).where(isNull(Activity.deleted_at));
    // Apply search condition if available
    if (searchTerm !== '') {
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
      result,
      ...paginate(totalRecords, page, limit),
    };
  }
}
