import { Injectable } from '@nestjs/common';
import { and, eq, isNull } from 'drizzle-orm';
import { MBrand, Program } from '../../../schema';
import { DrizzleService } from '../../../common/services/drizzle.service';
import {
  buildSearchQuery,
  decrypt,
  encrypt,
  paginate,
} from '../../../helpers/nojorono.helpers';
import { CreateProgramDto, UpdateProgramDto } from '../dtos/program.dtos';

@Injectable()
export class ProgramRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async decryptId(id: string) {
    const stringId = id.toString();
    return decrypt(stringId);
  }

  async encryptedId(id: number) {
    return encrypt(id.toString());
  }

  async create(createProgramDto: CreateProgramDto) {
    const db = this.drizzleService['db'];

    if (!db) {
      throw new Error('Database not initialized');
    }

    return await db.insert(Program).values(createProgramDto).returning();
  }

  async update(id: number, updateProgramDto: UpdateProgramDto) {
    const db = this.drizzleService['db'];
    return await db
      .update(Program)
      .set(updateProgramDto)
      .where(eq(Program.id, id))
      .execute();
  }

  async getById(id: number) {
    const db = this.drizzleService['db'];

    if (!db) {
      throw new Error('Database not initialized');
    }

    const result = await db.select().from(Program).where(eq(Program.id, id));
    return result[0]; // Return the first (and expectedly only) result
  }

  async delete(id: number, userBy: string) {
    const db = this.drizzleService['db'];
    if (!db) {
      throw new Error('Database not initialized');
    }
    return await db
      .update(Program)
      .set({ deleted_at: new Date(), deleted_by: userBy })
      .where(eq(Program.id, id))
      .returning();
  }

  async findByName(name: string) {
    const db = this.drizzleService['db'];
    if (!db) {
      throw new Error('Database not initialized');
    }
    return await db.query.Program.findFirst({ where: eq(Program.name, name) });
  }

  async getAllActive(
    page: number = 1,
    limit: number = 10,
    searchTerm: string = '',
  ) {
    const db = this.drizzleService['db'];

    if (!db) {
      throw new Error('Database not initialized');
    }

    const query = db.select().from(Program).where(isNull(Program.deleted_at));

    // Apply search condition if available
    const searchColumns = ['brand'];
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

    return {
      data: result,
      ...paginate(totalRecords, page, limit),
    };
  }

  async getAll() {
    const db = this.drizzleService['db'];

    if (!db) {
      throw new Error('Database not initialized');
    }

    const query = await db
      .select()
      .from(Program)
      .where(and(isNull(Program.deleted_at)));

    const totalRecords = parseInt(query.length) || 0;

    return {
      data: query,
      totalRecords: totalRecords,
    };
  }
}
