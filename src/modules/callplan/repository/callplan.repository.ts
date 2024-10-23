import { Injectable } from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
import { CallPlan } from '../../../schema';
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
  // Create
  async createData(createCallPlanDto: CreateCallPlanDto) {
    const db = this.drizzleService['db'];

    // Destructure values from the DTO
    const {
      user_id,
      code_call_plan,
      area,
      region,
      start_plan,
      end_plan,
      created_by,
    } = createCallPlanDto;

    if (!db) {
      throw new Error('Database not initialized');
    }

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

  // Delete an Roles (soft delete by updating is_deleted field)
  async deleteById(id: string) {
    const db = this.drizzleService['db'];
    const idDecrypted = await this.decryptId(id);

    if (!db) {
      throw new Error('Database not initialized');
    }

    return await db
      .update(CallPlan)
      .set({ updated_at: new Date(), deleted_at: new Date() }) // assuming these fields exist
      .where(eq(CallPlan.id, idDecrypted))
      .returning();
  }

  // List all active Roles with pagination and search
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
      .where(eq(CallPlan.deleted_at, null))
      .execute();
    const totalRecords = parseInt(totalRecordsQuery[0]?.count) || 0;

    const { offset } = paginate(totalRecords, page, limit);

    // Build search query
    const searchColumns = ['name', 'description'];
    const searchCondition = buildSearchQuery(searchTerm, searchColumns);

    // Query for paginated and filtered results
    const query = db
      .select()
      .from(CallPlan)
      .where(eq(CallPlan.deleted_at, null))
      .limit(limit) // Specify your limit
      .offset(offset); // Specify your offset

    // Apply search condition if available
    if (searchCondition) {
      query.where(searchCondition);
    }

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
}
