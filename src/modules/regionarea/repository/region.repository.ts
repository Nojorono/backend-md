import { Injectable } from '@nestjs/common';
import { desc, eq, isNull, sql } from 'drizzle-orm';
import { MArea, MRegion } from '../../../schema';
import { DrizzleService } from '../../../common/services/drizzle.service';
import {
  buildSearchQuery,
  decrypt,
  encrypt,
  paginate,
} from '../../../helpers/nojorono.helpers';
import { CreateRegionDto, UpdateRegionDto } from '../dtos/region.dtos';

@Injectable()
export class RegionRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async decryptId(id: string) {
    const stringId = id.toString();
    return decrypt(stringId);
  }
  async encryptedId(id: number) {
    return encrypt(id.toString());
  }
  // Create Roles
  async create(createDto: CreateRegionDto) {
    const db = this.drizzleService['db'];
    if (!db) {
      throw new Error('Database not initialized');
    }
    return await db
      .insert(MRegion)
      .values({ ...createDto })
      .returning();
  }

  // Update Roles by ID
  async update(id: number, updateDto: UpdateRegionDto) {
    const db = this.drizzleService['db'];
    return await db
      .update(MRegion)
      .set(updateDto)
      .where(eq(MRegion.id, id))
      .execute();
  }

  async findLastInsert() {
    const db = this.drizzleService['db'];
    if (!db) {
      throw new Error('Database not initialized');
    }
    const lastEntry = await db
      .select()
      .from(MRegion)
      .orderBy(desc(MRegion.id))
      .limit(1);

    return lastEntry[0] ?? null;
  }

  // Get Roles by id
  async getById(id: number) {
    const db = this.drizzleService['db'];

    if (!db) {
      throw new Error('Database not initialized');
    }

    const result = await db.select().from(MRegion).where(eq(MRegion.id, id));
    return result[0];
  }

  // Get all List
  async getList() {
    const db = this.drizzleService['db'];
    if (!db) {
      throw new Error('Database not initialized');
    }
    return await db.select().from(MRegion).execute();
  }

  async delete(id: number, userBy: string) {
    const db = this.drizzleService['db'];
    if (!db) {
      throw new Error('Database not initialized');
    }
    return await db.transaction(async (tx) => {
      // Soft delete the main batch
      const deleteBatchResult = await tx
        .update(MRegion)
        .set({ deleted_at: new Date(), deleted_by: userBy })
        .where(eq(MRegion.id, id))
        .returning();

      await tx
        .update(MArea)
        .set({ deleted_at: new Date(), deleted_by: userBy })
        .where(eq(MArea.region_id, id));

      return deleteBatchResult;
    });
  }

  // List all active
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
      .from(MRegion)
      .where(isNull(MRegion.deleted_at))
      .execute();
    const totalRecords = parseInt(totalRecordsQuery[0]?.count) || 0;

    const { offset } = paginate(totalRecords, page, limit);

    // Build search query
    const searchColumns = ['name'];
    const searchCondition = buildSearchQuery(searchTerm, searchColumns);

    // Query for paginated and filtered results
    const query = db
      .select({
        id: MRegion.id,
        name: MRegion.name,
      })
      .from(MRegion)
      .where(isNull(MRegion.deleted_at))
      .limit(limit)
      .offset(offset);

    // Apply search condition if available
    if (searchCondition) {
      query.where(searchCondition);
    }

    const result = await query;

    // Return data with pagination metadata
    return {
      data: result,
      ...paginate(totalRecords, page, limit),
    };
  }
}
