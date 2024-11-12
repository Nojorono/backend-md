import { Injectable } from '@nestjs/common';
import { desc, eq } from 'drizzle-orm';
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
    return await db
      .insert(MbatchTarget)
      .values({ ...createBatchTargetDto })
      .returning();
  }

  // Update Roles by ID
  async update(id: string, updateBatchTargetDto: UpdateBatchTargetDto) {
    const db = this.drizzleService['db'];
    const idDecrypted = await this.decryptId(id);
    return await db
      .update(MbatchTarget)
      .set(updateBatchTargetDto)
      .where(eq(MbatchTarget.id, idDecrypted))
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
  async delete(id: string, userBy: string) {
    const idDecrypted = await this.decryptId(id);
    const db = this.drizzleService['db'];
    if (!db) {
      throw new Error('Database not initialized');
    }
    return await db
      .update(MbatchTarget)
      .set({ updated_at: new Date(), updated_by: userBy, is_active: 0 })
      .where(eq(MbatchTarget.id, idDecrypted))
      .returning();
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
      .where(eq(MbatchTarget.batch_id, idDecrypted));

    const totalRecords = parseInt(query.length) || 0;

    return {
      data: query,
      totalRecords: totalRecords,
    };
  }
}
