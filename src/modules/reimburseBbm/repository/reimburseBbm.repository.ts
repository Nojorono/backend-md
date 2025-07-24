import { Injectable } from '@nestjs/common';
import { desc, and, between, eq, like, or, sql } from 'drizzle-orm';
import { Absensi, mUser } from '../../../schema';
import { DrizzleService } from '../../../common/services/drizzle.service';
import { CreateDto, UpdateDto } from '../dtos/reimburseBbm.dtos';
import { paginate } from '../../../helpers/nojorono.helpers';
import { ReimburseBbm } from 'src/schema/reimburse.schema';

@Injectable()
export class ReimburseBbmRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async createData(CreateDto: CreateDto, userId: number) {
    const db = this.drizzleService['db'];

    if (!db) {
      throw new Error('Database not initialized');
    }

    return await db
      .insert(ReimburseBbm)
      .values({
        ...CreateDto,
        user_id: userId,
      })
      .returning();
  }

  async updateData(id: number, UpdateDto: UpdateDto) {
    const db = this.drizzleService['db'];
    return await db
      .update(ReimburseBbm)
      .set({
        ...UpdateDto,
      })
      .where(eq(ReimburseBbm.id, id))
      .execute();
  }

  async findByUserId(userId: number) {
    const db = this.drizzleService['db'];
    if (!db) {
      throw new Error('Database not initialized');
    }

    return await db.query.ReimburseBbm.findMany({
      where: (ReimburseBbm, { eq }) => eq(ReimburseBbm.user_id, userId),
    });
  }

  async findById(id: number) {
    const db = this.drizzleService['db'];
    return await db.query.ReimburseBbm.findFirst({
      where: (ReimburseBbm, { eq }) => eq(ReimburseBbm.id, id),
    });
  }

  async deleteById(id: number, userEmail: string) {
    const db = this.drizzleService['db'];

    if (!db) {
      throw new Error('Database not initialized');
    }

    return await db
      .update(ReimburseBbm)
      .set({ deleted_at: new Date(), deleted_by: userEmail })
      .where(eq(ReimburseBbm.id, id))
      .returning();
  }

  async getAll(
    page: number = 1,
    limit: number = 10,
    searchTerm: string = '',
    filter: any = {},
  ) {
    const db = this.drizzleService['db'];

    if (!db) {
      throw new Error('Database not initialized');
    }

    // Build base query with all needed relations
    const baseQuery = db
      .select({
        ...ReimburseBbm,
        user_name: mUser.fullname,
        user_email: mUser.email,
        user_area: mUser.area,
        user_region: mUser.region,
      })
      .from(ReimburseBbm)
      .leftJoin(mUser, eq(ReimburseBbm.user_id, mUser.id));

    // Build where conditions
    const whereConditions = [];

    if (searchTerm) {
      console.log(searchTerm);
      // Split search term by spaces and create conditions for each word
      const searchWords = searchTerm.trim().split(/\s+/);

      const searchConditions = searchWords.map((word) =>
        or(
          like(ReimburseBbm.description, `%${word}%`),
          like(mUser.fullname, `%${word}%`),
          like(mUser.email, `%${word}%`),
        ),
      );

      // Combine all word conditions with AND to match all words
      whereConditions.push(and(...searchConditions));
    }

    if (filter.date_start && filter.date_end) {
      const dateStart = new Date(filter.date_start);
      const dateEnd = new Date(filter.date_end);
      whereConditions.push(between(ReimburseBbm.date_in, dateStart, dateEnd));
    }

    if (filter.area) {
      whereConditions.push(eq(mUser.area, filter.area));
    }

    if (filter.region) {
      whereConditions.push(eq(mUser.region, filter.region));
    }

    if (filter.status) {
      whereConditions.push(eq(ReimburseBbm.status, filter.status));
    }

    // Apply where conditions
    const query =
      whereConditions.length > 0
        ? baseQuery.where(and(...whereConditions))
        : baseQuery;

    // Get total count for pagination
    const totalRecords = await db
      .select({ count: sql<number>`count(*)` })
      .from(query.as('subquery'))
      .then((result) => Number(result[0].count));

    // Apply pagination
    const { offset } = paginate(totalRecords, page, limit);
    const result = await query
      .orderBy(desc(ReimburseBbm.date_in))
      .limit(limit)
      .offset(offset)
      .execute();

    return {
      result,
      ...paginate(totalRecords, page, limit),
    };
  }
}
