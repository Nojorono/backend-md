import { Injectable } from '@nestjs/common';
import { desc, eq, sql } from 'drizzle-orm';
import { CallPlanSchedule, Mbatch } from '../../../schema';
import { DrizzleService } from '../../../common/services/drizzle.service';
import {
  buildSearchQuery,
  decrypt,
  encrypt,
  paginate,
} from '../../../helpers/nojorono.helpers';
import { CreateBatchDto, UpdateBatchDto } from '../dtos/batch.dtos';

@Injectable()
export class BatchRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async decryptId(id: string) {
    const stringId = id.toString();
    return decrypt(stringId);
  }
  async encryptedId(id: number) {
    return encrypt(id.toString());
  }
  // Create Roles
  async create(createRolesDto: CreateBatchDto) {
    const db = this.drizzleService['db'];

    if (!db) {
      throw new Error('Database not initialized');
    }
    return await db
      .insert(Mbatch)
      .values({ ...createRolesDto })
      .returning();
  }

  // Update Roles by ID
  async update(id: string, updateRolesDto: UpdateBatchDto) {
    const db = this.drizzleService['db'];
    const idDecrypted = await this.decryptId(id);
    return await db
      .update(Mbatch)
      .set(updateRolesDto)
      .where(eq(Mbatch.id, idDecrypted))
      .execute();
  }

  async findLastInsert() {
    const db = this.drizzleService['db'];
    if (!db) {
      throw new Error('Database not initialized');
    }
    const lastEntry = await db
      .select()
      .from(Mbatch)
      .orderBy(desc(Mbatch.id))
      .limit(1);

    return lastEntry[0] ?? null;
  }

  // Get Roles by id
  async getById(id: number) {
    const db = this.drizzleService['db'];

    if (!db) {
      throw new Error('Database not initialized');
    }

    const result = await db.select().from(Mbatch).where(eq(Mbatch.id, id));
    return result[0]; // Return the first (and expectedly only) result
  }

  // Get all List
  async getList() {
    const db = this.drizzleService['db'];
    if (!db) {
      throw new Error('Database not initialized');
    }
    return await db.select().from(Mbatch).execute();
  }

  // Delete an Roles (soft delete by updating is_deleted field)
  async delete(id: string, userBy: string) {
    const idDecrypted = await this.decryptId(id);
    const db = this.drizzleService['db'];
    if (!db) {
      throw new Error('Database not initialized');
    }
    return await db
      .update(Mbatch)
      .set({ updated_at: new Date(), updated_by: userBy, is_active: 0 }) // assuming these fields exist
      .where(eq(Mbatch.id, idDecrypted))
      .returning();
  }

  // List all active Roles with pagination and search
  async getAllActive(
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
      .from(Mbatch)
      .execute();
    const totalRecords = parseInt(totalRecordsQuery[0]?.count) || 0;

    const { offset } = paginate(totalRecords, page, limit);

    // Build search query
    const searchColumns = ['name', 'description'];
    const searchCondition = buildSearchQuery(searchTerm, searchColumns);

    // Query for paginated and filtered results
    const query = db
      .select({
        id: Mbatch.id,
        code_batch: Mbatch.code_batch,
        start_plan: Mbatch.start_plan,
        end_plan: Mbatch.end_plan,
      })
      .from(Mbatch)
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