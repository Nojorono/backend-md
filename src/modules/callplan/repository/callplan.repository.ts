import { Injectable } from '@nestjs/common';
import { desc, eq, isNull, inArray, and } from 'drizzle-orm';
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

  async validateCreate(data: any) {
    const db = this.drizzleService['db'];
    if (!db) {
      throw new Error('Database not initialized');
    }
    return await db
      .select()
      .from(CallPlan)
      .where(
        and(
          eq(CallPlan.code_batch, data.code_batch),
          eq(CallPlan.area, data.area),
          eq(CallPlan.region, data.region),
        ),
      )
      .limit(1);
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
  async createData(createCallPlanDto: CreateCallPlanDto, userEmail: string) {
    const db = this.drizzleService['db'];

    if (!db) {
      throw new Error('Database not initialized');
    }

    const { area, region, code_batch } = createCallPlanDto;

    return await db
      .insert(CallPlan)
      .values({
        code_batch,
        area,
        region,
        created_by: userEmail,
        created_at: new Date(),
      })
      .returning();
  }

  // Update by ID
  async updateData(
    id: string,
    updateCallPlanDto: UpdateCallPlanDto,
    userEmail: string,
  ) {
    const idDecrypted = await this.decryptId(id);
    const db = this.drizzleService['db'];
    const { code_batch, area, region } = updateCallPlanDto;
    return await db
      .update(CallPlan)
      .set({
        code_batch,
        area,
        region,
        updated_by: userEmail,
        updated_at: new Date(),
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

  async deleteById(id: string, userEmail: string) {
    const db = this.drizzleService['db'];
    const idDecrypted = await this.decryptId(id);

    if (!db) {
      throw new Error('Database not initialized');
    }

    return await db
      .update(CallPlan)
      .set({
        updated_at: new Date(),
        deleted_at: new Date(),
        deleted_by: userEmail,
      })
      .where(eq(CallPlan.id, idDecrypted))
      .returning();
  }

  async getAllCallPlan(
    page: number = 1,
    limit: number = 10,
    searchTerm: string = '',
    filter: { area: string[]; region: string },
  ) {
    const db = this.drizzleService['db'];

    if (!db) {
      throw new Error('Database not initialized');
    }

    const query = db.select().from(CallPlan).where(isNull(CallPlan.deleted_at));

    // Apply region filter if provided
    if (filter.region) {
      query.where(eq(CallPlan.region, filter.region));
    }

    // Apply area filter if provided (assuming 'area' is an array in filter)
    if (Array.isArray(filter.area) && filter.area.length > 0) {
      query.where(inArray(CallPlan.area, filter.area));
    }

    // Apply search condition if available
    const searchColumns = ['region', 'code_batch', 'area'];
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
