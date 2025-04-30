import { Injectable } from '@nestjs/common';
import { and, desc, eq, isNull } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import { MbatchTarget } from '../../../schema';
import { DrizzleService } from '../../../common/services/drizzle.service';
import { decrypt, encrypt } from '../../../helpers/nojorono.helpers';
import {
  CreateBatchTargetDto,
  UpdateBatchTargetDto,
} from '../dtos/batchtarget.dtos';

@Injectable()
export class BatchTargetRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async decryptId(id: string) {
    const stringId = id.toString();
    return decrypt(stringId);
  }
  async encryptedId(id: number) {
    return encrypt(id.toString());
  }
  // Create
  async create(createBatchTargetDto: CreateBatchTargetDto) {
    const db = this.drizzleService['db'];
    if (!db) {
      throw new Error('Database not initialized');
    }
    const idDecrypted = await this.decryptId(createBatchTargetDto.batch_id);
    return await db
      .insert(MbatchTarget)
      .values({
        batch_id: idDecrypted,
        regional: createBatchTargetDto.regional,
        amo: createBatchTargetDto.amo,
        brand: createBatchTargetDto.brand,
        sio_type: createBatchTargetDto.sio_type,
        brand_type_sio: createBatchTargetDto.brand_type_sio,
        amo_brand_type: createBatchTargetDto.amo_brand_type,
        allocation_ho: createBatchTargetDto.allocation_ho,
      })
      .returning();
  }

  async createDummy(createBatchTargetDto: CreateBatchTargetDto) {
    const db = this.drizzleService['db'];
    if (!db) {
      throw new Error('Database not initialized');
    }
    return await db
      .insert(MbatchTarget)
      .values({ ...createBatchTargetDto })
      .returning();
  }

  // Update Roles by ID
  async update(id: number, updateBatchTargetDto: UpdateBatchTargetDto) {
    const db = this.drizzleService['db'];
    return await db
      .update(MbatchTarget)
      .set(updateBatchTargetDto)
      .where(eq(MbatchTarget.id, id))
      .execute();
  }

  async findLastInsert() {
    const db = this.drizzleService['db'];
    if (!db) {
      throw new Error('Database not initialized');
    }
    const lastEntry = await db
      .select()
      .from(MbatchTarget)
      .orderBy(desc(MbatchTarget.id))
      .limit(1);

    return lastEntry[0] ?? null;
  }

  // Get by id
  async getById(id: number) {
    const db = this.drizzleService['db'];

    if (!db) {
      throw new Error('Database not initialized');
    }

    const result = await db
      .select()
      .from(MbatchTarget)
      .where(eq(MbatchTarget.id, id));
    return result[0]; // Return the first (and expectedly only) result
  }

  // Get all List
  async getList() {
    const db = this.drizzleService['db'];
    if (!db) {
      throw new Error('Database not initialized');
    }
    return await db.select().from(MbatchTarget).execute();
  }

  // Delete an Roles (soft delete by updating is_deleted field)
  async delete(id: number, userBy: string) {
    const db = this.drizzleService['db'];
    if (!db) {
      throw new Error('Database not initialized');
    }
    return await db
      .update(MbatchTarget)
      .set({ deleted_at: new Date(), deleted_by: userBy })
      .where(eq(MbatchTarget.id, id))
      .returning();
  }

  async findBatchAmoBrandType(amo_brand_type: string) {
    const db = this.drizzleService['db'];
    if (!db) {
      throw new Error('Database not initialized');
    }
    const result = await db
      .select()
      .from(MbatchTarget)
      .where(eq(MbatchTarget.amo_brand_type, amo_brand_type));
    return result[0]; // Return the first (and expectedly only) result
  }

  // List outlet summary
    async findSummaryAmoBrandType(amo_brand_type: string) {
      const db = this.drizzleService['db'];
      if (!db) {
        throw new Error('Database not initialized');
      }
      // Querying the outlet_summary view
      const result = await db.execute(
        sql`SELECT * FROM outlet_summary WHERE brand_type_outlet = ${amo_brand_type};`,
      );
      return result.rows;
    }

  // List all active Roles with pagination and search
  async getAll(batchId: string) {
    const db = this.drizzleService['db'];

    if (!db) {
      throw new Error('Database not initialized');
    }

    const idDecrypted = await this.decryptId(batchId);

    const query = await db
      .select({
        id: MbatchTarget.id,
        batch_id: MbatchTarget.batch_id,
        regional: MbatchTarget.regional,
        amo: MbatchTarget.amo,
        brand_type_sio: MbatchTarget.brand_type_sio,
        amo_brand_type: MbatchTarget.amo_brand_type,
        allocation_ho: MbatchTarget.allocation_ho,
      })
      .from(MbatchTarget)
      .where(
        and(
          eq(MbatchTarget.batch_id, idDecrypted),
          isNull(MbatchTarget.deleted_at),
        ),
      );

    const totalRecords = parseInt(query.length) || 0;

    return {
      data: query,
      totalRecords: totalRecords,
    };
  }
}
