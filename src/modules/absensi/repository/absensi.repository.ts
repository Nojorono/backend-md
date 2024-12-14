import { Injectable } from '@nestjs/common';
import { desc, and, between, eq, like, or, sql } from 'drizzle-orm';
import { Absensi, mUser } from '../../../schema';
import { DrizzleService } from '../../../common/services/drizzle.service';
import { CreateDto, UpdateDto } from '../dtos/absensi.dtos';
import { paginate } from '../../../helpers/nojorono.helpers';

@Injectable()
export class AbsensiRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async createData(CreateDto: CreateDto) {
    const db = this.drizzleService['db'];

    if (!db) {
      throw new Error('Database not initialized');
    }

    return await db
      .insert(Absensi)
      .values({
        ...CreateDto,
        longitudeIn: CreateDto.longitude,
        latitudeIn: CreateDto.latitude,
      })
      .returning();
  }

  async updateData(id: number, UpdateDto: UpdateDto) {
    const db = this.drizzleService['db'];
    return await db
      .update(Absensi)
      .set({
        ...UpdateDto,
        longitudeOut: UpdateDto.longitude,
        latitudeOut: UpdateDto.latitude,
      })
      .where(eq(Absensi.id, id))
      .execute();
  }

  async findByUserId(userId: number) {
    const db = this.drizzleService['db'];
    if (!db) {
      throw new Error('Database not initialized');
    }

    const dateNow = new Date();

    return await db.query.Absensi.findFirst({
      where: (Absensi, { eq, and }) =>
        and(eq(Absensi.userId, userId), eq(Absensi.date, dateNow)),
    });
  }
  // Delete an outlet (soft delete by updating is_deleted field)
  async deleteById(id: number, userEmail: string) {
    const db = this.drizzleService['db'];

    if (!db) {
      throw new Error('Database not initialized');
    }

    return await db
      .update(Absensi)
      .set({ deleted_at: new Date(), deleted_by: userEmail })
      .where(eq(Absensi.id, id))
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
        ...Absensi,
        user_name: mUser.fullname,
      })
      .from(Absensi)
      .leftJoin(mUser, eq(Absensi.userId, mUser.id));

    // Build where conditions
    const whereConditions = [];

    if (searchTerm) {
      // Split search term by spaces and create conditions for each word
      const searchWords = searchTerm.trim().split(/\s+/);

      const searchConditions = searchWords.map((word) =>
        or(
          like(Absensi.status, `%${word}%`),
          like(Absensi.remarks, `%${word}%`),
          like(mUser.fullname, `%${word}%`),
        ),
      );

      // Combine all word conditions with AND to match all words
      whereConditions.push(and(...searchConditions));
    }

    if (filter.region) {
      whereConditions.push(eq(Absensi.region, filter.region));
    }

    if (filter.area) {
      whereConditions.push(eq(Absensi.area, filter.area));
    }

    if (filter.date_start && filter.date_end) {
      const dateStart = new Date(filter.date_start);
      const dateEnd = new Date(filter.date_end);
      whereConditions.push(between(Absensi.createdAt, dateStart, dateEnd));
    }

    if (filter.status) {
      whereConditions.push(eq(Absensi.status, filter.status));
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
      .orderBy(desc(Absensi.createdAt))
      .limit(limit)
      .offset(offset)
      .execute();

    return {
      result,
      ...paginate(totalRecords, page, limit),
    };
  }
}
