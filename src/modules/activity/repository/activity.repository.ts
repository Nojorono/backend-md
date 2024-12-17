import { Injectable } from '@nestjs/common';
import { and, between, desc, eq, isNull, like, or, sql } from 'drizzle-orm';
import { Activity, CallPlan, mOutlets, mUser, Survey } from '../../../schema';
import { DrizzleService } from '../../../common/services/drizzle.service';
import { paginate } from '../../../helpers/nojorono.helpers';
import {
  CreateMdActivityDto,
  UpdateMdActivityDto,
  UpdateStatusDto,
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
    filter: any = {},
  ) {
    const db = this.drizzleService['db'];

    if (!db) {
      throw new Error('Database not initialized');
    }

    // Build base query with all needed relations
    const baseQuery = db
      .select({
        ...Activity,
        outlet_name: mOutlets.name,
        survey_name: Survey.name,
        user_name: mUser.fullname,
        code_batch: CallPlan.code_batch,
      })
      .from(Activity)
      .leftJoin(mOutlets, eq(Activity.outlet_id, mOutlets.id))
      .leftJoin(Survey, eq(Activity.survey_outlet_id, Survey.id))
      .leftJoin(mUser, eq(Activity.user_id, mUser.id))
      .leftJoin(CallPlan, eq(Activity.call_plan_id, CallPlan.id))
      .where(isNull(Activity.deleted_at));

    // Build where conditions
    const whereConditions = [];

    if (searchTerm) {
      // Split search term by spaces and create conditions for each word
      const searchWords = searchTerm.trim().split(/\s+/);
      
      const searchConditions = searchWords.map(word => 
        or(
          like(mOutlets.name, `%${word}%`),
          like(Survey.name, `%${word}%`),
          like(mUser.fullname, `%${word}%`),
          like(CallPlan.code_batch, `%${word}%`),
        )
      );

      // Combine all word conditions with AND to match all words
      whereConditions.push(and(...searchConditions));
    }

    if (filter.region) {
      whereConditions.push(eq(Activity.region, filter.region));
    }

    if (filter.area) {
      whereConditions.push(eq(Activity.area, filter.area));
    }

    if (filter.brand) {
      whereConditions.push(eq(Activity.brand, filter.brand));
    }

    if (filter.sio_type) {
      whereConditions.push(eq(Activity.type_sio, filter.sio_type));
    }

    if (filter.date_start && filter.date_end) {
      const dateStart = new Date(filter.date_start);
      const dateEnd = new Date(filter.date_end);
      whereConditions.push(between(Activity.created_at, dateStart, dateEnd));
    }

    if (filter.status) {
      whereConditions.push(eq(Activity.status, filter.status));
    }

    // Apply where conditions
    const query = whereConditions.length > 0
      ? baseQuery.where(and(...whereConditions))
      : baseQuery;

    // Get total count for pagination
    const totalRecords = await db
      .select({ count: sql<number>`count(*)` })
      .from(query.as('subquery'))
      .then(result => Number(result[0].count));

    // Apply pagination
    const { offset } = paginate(totalRecords, page, limit);
    const result = await query
      .orderBy(desc(Activity.created_at))
      .limit(limit)
      .offset(offset)
      .execute();

    return {
      result,
      ...paginate(totalRecords, page, limit),
    };
  }

  async updateStatus(id: number, updateDto: UpdateStatusDto) {
    const db = this.drizzleService['db'];
    return await db
      .update(Activity)
      .set({ status: updateDto.status })
      .where(eq(Activity.id, id))
      .execute();
  }
}
