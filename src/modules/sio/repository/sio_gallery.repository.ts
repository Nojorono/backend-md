import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { SioTypeGalery } from '../../../schema';
import { DrizzleService } from '../../../common/services/drizzle.service';
import { buildSearchQuery, paginate } from '../../../helpers/nojorono.helpers';
import {
  CreateSioGalleryDto,
  UpdateSioGalleryDto,
} from '../dtos/sio_gallery.dtos';

@Injectable()
export class SioGalleryRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async create(createDto: CreateSioGalleryDto) {
    const db = this.drizzleService['db'];

    if (!db) {
      throw new Error('Database not initialized');
    }

    return await db.insert(SioTypeGalery).values(createDto).returning();
  }

  async update(id: number, updateDto: UpdateSioGalleryDto) {
    const db = this.drizzleService['db'];
    return await db
      .update(SioTypeGalery)
      .set(updateDto)
      .where(eq(SioTypeGalery.id, id))
      .execute();
  }

  async getById(id: number) {
    const db = this.drizzleService['db'];

    if (!db) {
      throw new Error('Database not initialized');
    }

    const result = await db
      .select()
      .from(SioTypeGalery)
      .where(eq(SioTypeGalery.id, id));
    return result[0]; // Return the first (and expectedly only) result
  }

  async delete(id: number) {
    const db = this.drizzleService['db'];
    if (!db) {
      throw new Error('Database not initialized');
    }
    
    return await db
      .delete(SioTypeGalery)
      .where(eq(SioTypeGalery.id, id))
      .returning();
  }

  async getAllActive(
    sioTypeId: number,
    page: number = 1,
    limit: number = 10,
    searchTerm: string = '',
  ) {
    const db = this.drizzleService['db'];

    if (!db) {
      throw new Error('Database not initialized');
    }

    let query = db
      .select()
      .from(SioTypeGalery)
      .where(eq(SioTypeGalery.sio_type_id, sioTypeId));

    // Apply search condition if available
    const searchColumns = ['name'];
    const searchCondition = buildSearchQuery(searchTerm, searchColumns);

    if (searchCondition) {
      query = query.where(searchCondition);
    }

    // Get total count first
    const totalRecords = await query.execute();
    const totalCount = totalRecords.length;

    // Apply pagination
    const { offset } = paginate(totalCount, page, limit);
    const result = await query.limit(limit).offset(offset);

    return {
      data: result,
      ...paginate(totalCount, page, limit),
    };
  }

  async getAll(sioTypeId: number = 0) {
    const db = this.drizzleService['db'];

    if (!db) {
      throw new Error('Database not initialized');
    }

    const query = db
      .select()
      .from(SioTypeGalery)
      .where(eq(SioTypeGalery.sio_type_id, sioTypeId));

    const result = await query.execute();
    const totalRecords = result.length;

    return {
      data: result,
      totalRecords: totalRecords,
    };
  }
}
