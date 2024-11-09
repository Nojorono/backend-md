import { Injectable } from '@nestjs/common';
import { desc, eq, isNull, count } from 'drizzle-orm';
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

    const { area, region, code_batch, created_by } = createCallPlanDto;

    return await db
      .insert(CallPlan)
      .values({
        code_batch,
        area,
        region,
        created_by,
        created_at: new Date(),
      })
      .returning();
  }

  // Update by ID
  async updateData(id: string, updateCallPlanDto: UpdateCallPlanDto) {
    const idDecrypted = await this.decryptId(id);
    const db = this.drizzleService['db'];
    const { code_batch, area, region, updated_by } = updateCallPlanDto;
    return await db
      .update(CallPlan)
      .set({
        code_batch,
        area,
        region,
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
  async getCallPlanByUserId() {
    const db = this.drizzleService['db'];

    if (!db) {
      throw new Error('Database not initialized');
    }

    return await db.query.CallPlan.findMany();
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

    // Define the search columns and build search condition
    const searchColumns = ['region', 'code_batch', 'area'];
    const searchCondition = buildSearchQuery(searchTerm, searchColumns);

    // Count query for total records
    const countQuery = db
      .select({ count: count() })
      .from(CallPlan)
      .where(isNull(CallPlan.deleted_at));

    if (searchCondition) {
      countQuery.where(searchCondition);
    }

    const totalRecordsResult = await countQuery;
    const totalRecords = totalRecordsResult[0]?.count ?? 0;
    // Query for paginated and filtered results
    let paginatedQuery = db
      .select({
        id: CallPlan.id,
        code_batch: CallPlan.code_batch,
        area: CallPlan.area,
        region: CallPlan.region,
      })
      .from(CallPlan)
      .where(isNull(CallPlan.deleted_at))
      .limit(limit)
      .offset((page - 1) * limit);

    if (searchCondition) {
      paginatedQuery = paginatedQuery.where(searchCondition);
    }
    const result = await paginatedQuery;

    const encryptedResult = await Promise.all(
      result.map(async (item) => {
        const encryptedId = await this.encryptedId(item.id);

        return {
          ...item,
          id: encryptedId,
        };
      }),
    );

    // Return data with pagination metadata
    return {
      data: encryptedResult,
      totalItems: totalRecords,
      currentPage: page,
      totalPages: Math.ceil(totalRecords / limit),
    };
  }
}
