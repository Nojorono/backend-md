import { Injectable } from '@nestjs/common';
import { and, desc, eq, isNull } from 'drizzle-orm';
import { MArea, MbatchTarget } from '../../../schema';
import { DrizzleService } from '../../../common/services/drizzle.service';
import { decrypt, encrypt } from '../../../helpers/nojorono.helpers';
import { CreateAreaDto, UpdateAreaDto } from '../dtos/area.dtos';

@Injectable()
export class AreaRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async decryptId(id: string) {
    const stringId = id.toString();
    return decrypt(stringId);
  }
  async encryptedId(id: number) {
    return encrypt(id.toString());
  }
  // Create
  async create(CreateAreaDto: CreateAreaDto) {
    const db = this.drizzleService['db'];
    if (!db) {
      throw new Error('Database not initialized');
    }
    return await db
      .insert(MArea)
      .values({
        ...CreateAreaDto,
      })
      .returning();
  }

  async update(id: number, UpdateAreaDto: UpdateAreaDto) {
    const db = this.drizzleService['db'];
    return await db
      .update(MArea)
      .set({ ...UpdateAreaDto })
      .where(eq(MArea.id, id))
      .execute();
  }

  async findLastInsert() {
    const db = this.drizzleService['db'];
    if (!db) {
      throw new Error('Database not initialized');
    }
    const lastEntry = await db
      .select()
      .from(MArea)
      .orderBy(desc(MArea.id))
      .limit(1);

    return lastEntry[0] ?? null;
  }

  // Get by id
  async getById(id: number) {
    const db = this.drizzleService['db'];

    if (!db) {
      throw new Error('Database not initialized');
    }

    const result = await db.select().from(MArea).where(eq(MArea.id, id));
    return result[0];
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
      .update(MArea)
      .set({ deleted_at: new Date(), deleted_by: userBy })
      .where(eq(MArea.id, id))
      .returning();
  }

  // List all active Roles with pagination and search
  async getAll(id: number) {
    const db = this.drizzleService['db'];

    if (!db) {
      throw new Error('Database not initialized');
    }

    const query = await db
      .select()
      .from(MArea)
      .where(and(eq(MArea.region_id, id), isNull(MArea.deleted_at)));

    const totalRecords = parseInt(query.length) || 0;

    return {
      data: query,
      totalRecords: totalRecords,
    };
  }
}
