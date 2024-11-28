import { Injectable } from '@nestjs/common';
import { and, desc, eq, isNull } from 'drizzle-orm';
import { CallPlanSchedule, mOutlets, mUser } from '../../../schema';
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
import { STATUS_ACTIVITY_MD_2 } from 'src/constants';

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
    } = createCallPlanScheduleDto;

    if (!db) {
      throw new Error('Database not initialized');
    }

    return await db
      .insert(CallPlanSchedule)
      .values({
        call_plan_id: idDecrypted,
        code_call_plan,
        outlet_id,
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
    const { outlet_id, notes, day_plan, updated_by } =
      updateCallPlanScheduleDto;
    return await db
      .update(CallPlanSchedule)
      .set({
        outlet_id,
        notes,
        day_plan,
        updated_by,
        updated_at: new Date(),
      })
      .where(eq(CallPlanSchedule.id, idDecrypted))
      .execute();
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
      })
      .from(CallPlanSchedule)
      .innerJoin(mOutlets, eq(CallPlanSchedule.outlet_id, mOutlets.id))
      .innerJoin(mUser, eq(CallPlanSchedule.user_id, mUser.id))
      .where(
        and(eq(CallPlanSchedule.call_plan_id, idDecrypted)),
        isNull(CallPlanSchedule.deleted_at),
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
          eq(CallPlanSchedule.status, STATUS_ACTIVITY_MD_2),
          isNull(CallPlanSchedule.deleted_at),
        ),
      with: {
        callPlanOutlet: true,
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
