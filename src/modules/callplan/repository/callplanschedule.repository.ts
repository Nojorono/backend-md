import { Injectable } from '@nestjs/common';
import { and, asc, desc, eq, isNull, sql } from 'drizzle-orm';
import { CallPlanSchedule, mOutlets, mUser, Survey } from '../../../schema';
import { DrizzleService } from '../../../common/services/drizzle.service';
import {
  buildSearchQuery,
  decrypt,
  encrypt,
  paginate,
} from '../../../helpers/nojorono.helpers';
import {
  CreateCallPlanScheduleDto,
  UpdateCallPlanScheduleDto,
} from '../dtos/callplanschedule.dtos';
import { STATUS_NOT_VISITED, STATUS_VISITED } from 'src/constants';

@Injectable()
export class CallPlanScheduleRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async decryptId(id: string) {
    const stringId = id.toString();
    return decrypt(stringId);
  }

  async encryptedId(id: number) {
    return encrypt(id.toString());
  }

  // Create
  async createData(createCallPlanScheduleDto: CreateCallPlanScheduleDto) {
    const db = this.drizzleService['db'];
    const idDecrypted = await this.decryptId(
      createCallPlanScheduleDto.call_plan_id,
    );

    // Destructure values from the DTO
    const {
      code_call_plan,
      outlet_id,
      notes,
      day_plan,
      created_by,
      user_id,
      type,
      status,
      survey_outlet_id,
      program_id,
    } = createCallPlanScheduleDto;

    if (!db) {
      throw new Error('Database not initialized');
    }

    return await db
      .insert(CallPlanSchedule)
      .values({
        call_plan_id: idDecrypted,
        program_id,
        code_call_plan,
        outlet_id,
        survey_outlet_id,
        notes,
        user_id,
        day_plan,
        created_by,
        created_at: new Date(),
        type,
        status,
      })
      .returning();
  }

  async findByDayPlanExistOutlet(day_plan: Date, outlet_id: number, survey_outlet_id: number) {
    const db = this.drizzleService['db'];
    return await db.query.CallPlanSchedule.findFirst({
      where: (CallPlanSchedule, { eq, and, or }) => 
        and(
          eq(CallPlanSchedule.day_plan, day_plan),
          or(
            eq(CallPlanSchedule.outlet_id, outlet_id),
            eq(CallPlanSchedule.survey_outlet_id, survey_outlet_id)
          )
        ),
    });
  }

  async findLastId() {
    const db = this.drizzleService['db'];
    if (!db) {
      throw new Error('Database not initialized');
    }
    const lastEntry = await db
      .select()
      .from(CallPlanSchedule)
      .orderBy(desc(CallPlanSchedule.id))
      .limit(1);

    return lastEntry[0] ?? null;
  }

  // Update by ID
  async updateData(
    id: string,
    updateCallPlanScheduleDto: UpdateCallPlanScheduleDto,
  ) {
    const db = this.drizzleService['db'];
    const idDecrypted = await this.decryptId(id);

    return await db
      .update(CallPlanSchedule)
      .set({
        ...updateCallPlanScheduleDto,
        updated_at: new Date(),
      })
      .where(eq(CallPlanSchedule.id, idDecrypted))
      .execute();
  }

  async updateStatus(id: number, updateDto: any) {
    const db = this.drizzleService['db'];
    return await db.update(CallPlanSchedule).set({
      ...updateDto,
      updated_at: new Date(),
    }).where(eq(CallPlanSchedule.id, id)).execute();
  }

  // Get Schedule by callPlanId
  async getByIdCallPlan(
    id: string,
    page: number = 1,
    limit: number = 10,
    searchTerm: string = '',
    userId: number = null,
  ) {
    const db = this.drizzleService['db'];

    if (!db) {
      throw new Error('Database not initialized');
    }

    const idDecrypted = await this.decryptId(id);

    // Query for paginated and filtered results
    const query = db
      .select({
        ...CallPlanSchedule,
        email: mUser.email,
        outlet_code: mOutlets.outlet_code,
        outlet_name: mOutlets.name,
        survey_outlet_code: Survey.outlet_code,
        survey_outlet_name: Survey.name,
      })
      .from(CallPlanSchedule)
      .leftJoin(mOutlets, eq(CallPlanSchedule.outlet_id, mOutlets.id))
      .leftJoin(Survey, eq(CallPlanSchedule.survey_outlet_id, Survey.id))
      .leftJoin(mUser, eq(CallPlanSchedule.user_id, mUser.id))
      .where(
        and(
          eq(CallPlanSchedule.call_plan_id, idDecrypted),
          isNull(CallPlanSchedule.deleted_at)
        )
      )
      .orderBy(desc(CallPlanSchedule.id))
      .orderBy(
        sql`CASE 
          WHEN ${CallPlanSchedule.status} = 400 THEN 1
          ELSE 2
        END`
      );

    // Build search query
    const searchColumns = ['code_call_plan'];
    const searchCondition = buildSearchQuery(searchTerm, searchColumns);
    // Apply search condition if available
    if (searchCondition) {
      query.where(searchCondition);
    }
    if (userId) {
      query.where(eq(CallPlanSchedule.user_id, userId));
    }

    const records = await query.execute();
    const totalRecords = parseInt(records.length) || 0;
    const { offset } = paginate(totalRecords, page, limit);
    query.limit(limit).offset(offset);

    const result = await query;

    // Encrypt IDs for the returned data
    const encryptedResult = await Promise.all(
      result.map(async (item: { id: number }) => {
        return {
          ...item,
          id: await this.encryptedId(item.id),
        };
      }),
    );

    // Return data with pagination metadata
    return {
      data: encryptedResult,
      ...paginate(totalRecords, page, limit),
    };
  }

  // Get Schedule by callPlanId
  async getByIdUser(id: string) {
    const db = this.drizzleService['db'];
    const idDecrypted = await this.decryptId(id);
    if (!db) {
      throw new Error('Database not initialized');
    }
    return await db.query.CallPlanSchedule.findMany({
      where: (CallPlanSchedule, { eq, and }) =>
        and(
          eq(CallPlanSchedule.user_id, idDecrypted),
          eq(CallPlanSchedule.status, STATUS_NOT_VISITED),
          isNull(CallPlanSchedule.deleted_at),
        ),
      with: {
        callPlanOutlet: true,
        callPlanSurvey: true,
        callPlanProgram: true,
      },
    });
  }

  // Get Schedule by callPlanId
  async getHistoryByIdUser(id: string) {
    const db = this.drizzleService['db'];
    const idDecrypted = await this.decryptId(id);
    if (!db) {
      throw new Error('Database not initialized');
    }
    return await db.query.CallPlanSchedule.findMany({
      where: (CallPlanSchedule, { eq, and }) =>
        and(
          eq(CallPlanSchedule.user_id, idDecrypted),
          eq(CallPlanSchedule.status, STATUS_VISITED),
          isNull(CallPlanSchedule.deleted_at),
        ),
      with: {
        callPlanOutlet: true,
        callPlanSurvey: true,
        callPlanProgram: true,
      },
    });
  }

  // Get User by id
  async getCallPlanByUserId(id: string) {
    const db = this.drizzleService['db'];
    const idDecrypted = await this.decryptId(id);

    if (!db) {
      throw new Error('Database not initialized');
    }

    return await db.query.CallPlan.findMany({
      where: (CallPlan, { eq }) => eq(CallPlan.user_id, idDecrypted),
      with: {
        callPlan: true,
      },
      orderBy: (CallPlan, { desc }) => [desc(CallPlan.created_at)]
    });
  }

  async deleteById(id: string, userEmail: string) {
    const db = this.drizzleService['db'];
    const idDecrypted = await this.decryptId(id);

    if (!db) {
      throw new Error('Database not initialized');
    }

    return await db
      .update(CallPlanSchedule)
      .set({
        updated_at: new Date(),
        deleted_at: new Date(),
        deleted_by: userEmail,
      })
      .where(eq(CallPlanSchedule.id, idDecrypted))
      .returning();
  }
}
