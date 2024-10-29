import { Injectable } from '@nestjs/common';
import { desc, eq, isNull, sql } from 'drizzle-orm';
import { CallPlan, mUser } from '../../../schema';
import { DrizzleService } from '../../../common/services/drizzle.service';
import {
  buildSearchQuery,
  decrypt,
  encrypt,
  paginate,
} from '../../../helpers/nojorono.helpers';
import { CreateCallPlanDto, UpdateCallPlanDto } from '../dtos/callplan.dtos';

@Injectable()
export class CallPlanRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async decryptId(id: string) {
    const stringId = id.toString();
    return decrypt(stringId);
  }

  async encryptedId(id: number) {
    return encrypt(id.toString());
  }

  async findLastId() {
    const db = this.drizzleService['db'];
    if (!db) {
      throw new Error('Database not initialized');
    }
    const lastEntry = await db
      .select()
      .from(CallPlan)
      .orderBy(desc(CallPlan.id))
      .limit(1);

    return lastEntry[0] ?? null;
  }

  // Create
  async createData(createCallPlanDto: CreateCallPlanDto) {
    const db = this.drizzleService['db'];

    if (!db) {
      throw new Error('Database not initialized');
    }

    const {
      user_id,
      area,
      region,
      code_call_plan,
      start_plan,
      end_plan,
      created_by,
    } = createCallPlanDto;

    return await db
      .insert(CallPlan)
      .values({
        user_id,
        code_call_plan,
        area,
        region,
        start_plan,
        end_plan,
        created_by,
        created_at: new Date(),
      })
      .returning();
  }

  // Update by ID
  async updateData(id: string, updateCallPlanDto: UpdateCallPlanDto) {
    const idDecrypted = await this.decryptId(id);
    const db = this.drizzleService['db'];
    const {
      user_id,
      code_call_plan,
      area,
      region,
      start_plan,
      end_plan,
      updated_by,
    } = updateCallPlanDto;
    return await db
      .update(CallPlan)
      .set({
        user_id,
        code_call_plan,
        area,
        region,
        start_plan,
        end_plan,
        updated_by,
        created_at: new Date(),
      })
      .where(eq(CallPlan.id, idDecrypted))
      .execute();
  }

  // Get Roles by id
  async getById(id: string) {
    const db = this.drizzleService['db'];
    const idDecrypted = await this.decryptId(id);

    if (!db) {
      throw new Error('Database not initialized');
    }

    const result = await db
      .select()
      .from(CallPlan)
      .where(eq(CallPlan.id, idDecrypted));
    return result[0]; // Return the first (and expectedly only) result
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

  async deleteById(id: string) {
    const db = this.drizzleService['db'];
    const idDecrypted = await this.decryptId(id);

    if (!db) {
      throw new Error('Database not initialized');
    }

    return await db
      .update(CallPlan)
      .set({ updated_at: new Date(), deleted_at: new Date() })
      .where(eq(CallPlan.id, idDecrypted))
      .returning();
  }

  async getAllCallPlan(
    page: number = 1,
    limit: number = 10,
    searchTerm: string = '',
  ) {
    const db = this.drizzleService['db'];

    if (!db) {
      throw new Error('Database not initialized');
    }

    // Apply pagination logic
    const totalRecordsQuery = await db
      .select({ count: sql`COUNT(*)` })
      .from(CallPlan)
      .where(isNull(CallPlan.deleted_at))
      .execute();
    const totalRecords = parseInt(totalRecordsQuery[0]?.count) || 0;

    const { offset } = paginate(totalRecords, page, limit);

    // Build search query
    const searchColumns = ['call_plan.area', 'call_plan.region'];
    const searchCondition = buildSearchQuery(searchTerm, searchColumns);

    // Query for paginated and filtered results
    const query = db
      .select()
      .from(CallPlan)
      .leftJoin(mUser, eq(CallPlan.user_id, mUser.id))
      .where(isNull(CallPlan.deleted_at))
      .limit(limit) // Specify your limit
      .offset(offset); // Specify your offset

    // Apply search condition if available
    if (searchCondition) {
      query.where(searchCondition);
    }

    const result = await query;

    const encryptedResult = await Promise.all(
      result.map(async (item) => {
        const encryptedId = await this.encryptedId(item.call_plan.id); // Encrypt the call_plan.id

        return {
          ...item,
          call_plan: {
            ...item.call_plan,
            id: encryptedId,
          },
        };
      }),
    );

    // Return data with pagination metadata
    return {
      data: encryptedResult,
      ...paginate(totalRecords, page, limit),
    };
  }
}
