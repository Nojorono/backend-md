import { Injectable } from '@nestjs/common';
import { eq, sql, count } from 'drizzle-orm';
import { mOutlets } from '../../../schema';
import { DrizzleService } from '../../../common/services/drizzle.service';
import { CreateOutletDto, UpdateOutletDto } from '../dtos/outlet.dtos';
import {
  buildSearchQuery,
  decrypt,
  encrypt,
} from '../../../helpers/nojorono.helpers';

@Injectable()
export class OutletRepository {
  constructor(private readonly drizzleService: DrizzleService) {}
  async decryptId(id: string) {
    const stringId = id.toString();
    return decrypt(stringId);
  }
  async encryptedId(id: number) {
    return encrypt(id.toString());
  }
  // Create an outlet
  async createOutlet(createOutletDto: CreateOutletDto) {
    const db = this.drizzleService['db'];

    if (!db) {
      throw new Error('Database not initialized');
    }

    const result = await db
      .insert(mOutlets)
      .values({
        outlet_code: createOutletDto.outlet_code,
        name: createOutletDto.name,
        brand: createOutletDto.brand,
        unique_name: createOutletDto.unique_name,
        address_line: createOutletDto.address_line,
        sub_district: createOutletDto.sub_district,
        district: createOutletDto.district,
        city_or_regency: createOutletDto.city_or_regency || '',
        postal_code: createOutletDto.postal_code,
        latitude: createOutletDto.latitude || '',
        longitude: createOutletDto.longitude || '',
        outlet_type: createOutletDto.outlet_type || '',
        region: createOutletDto.region || '',
        area: createOutletDto.area || '',
        cycle: createOutletDto.cycle || '',
        is_active:
          createOutletDto.is_active !== undefined
            ? createOutletDto.is_active
            : 1, // Defaulting to 1
        visit_day: createOutletDto.visit_day,
        odd_even: createOutletDto.odd_even,
        photos: createOutletDto.photos || [], // Default to an empty array if undefined
        remarks: createOutletDto.remarks || '', // Default to an empty string if undefined
        created_by: createOutletDto.created_by,
        updated_by: createOutletDto.updated_by,
        deleted_by: createOutletDto.deleted_by,
        deleted_at: createOutletDto.deleted_at,
        created_at: createOutletDto.created_at || new Date(), // Default to current date
        updated_at: createOutletDto.updated_at || new Date(), // Default to current date
      })
      .returning();

    return result;
  }
  // Update Outlet by ID
  async updateOutlet(id: number, updateOutletDto: UpdateOutletDto) {
    const db = this.drizzleService['db'];
    return await db
      .update(mOutlets)
      .set(updateOutletDto)
      .where(eq(mOutlets.id, id))
      .execute();
  }
  // Get outlet by id
  async getOutletById(id: number) {
    const db = this.drizzleService['db'];

    if (!db) {
      throw new Error('Database not initialized');
    }

    const result = await db.select().from(mOutlets).where(eq(mOutlets.id, id));
    return result[0]; // Return the first (and expectedly only) result
  }
  // Delete an outlet (soft delete by updating is_deleted field)
  async deleteOutlet(id: number) {
    const db = this.drizzleService['db'];

    if (!db) {
      throw new Error('Database not initialized');
    }

    return await db
      .update(mOutlets)
      .set({ deleted_at: new Date(), deleted_by: 'admin', is_active: 0 })
      .where(eq(mOutlets.id, id))
      .returning();
  }

  async getAllActiveOutlets(
    page: number = 1,
    limit: number = 10,
    searchTerm: string = '',
  ) {
    const db = this.drizzleService['db'];

    if (!db) {
      throw new Error('Database not initialized');
    }

    // Define the search columns and build search condition
    const searchColumns = ['name', 'brand', 'area', 'region'];
    const searchCondition = buildSearchQuery(searchTerm, searchColumns);

    // Count query for total records
    const countQuery = db
      .select({ count: count() })
      .from(mOutlets)
      .where(eq(mOutlets.is_active, 1));

    if (searchCondition) {
      countQuery.where(searchCondition);
    }

    const totalRecordsResult = await countQuery;
    const totalRecords = totalRecordsResult[0]?.count ?? 0;
    // Paginated data query
    let paginatedQuery = db
      .select({
        id: mOutlets.id,
        outlet_code: mOutlets.outlet_code,
        name: mOutlets.name,
        brand: mOutlets.brand,
        unique_name: mOutlets.unique_name,
        address_line: mOutlets.address_line,
        sub_district: mOutlets.sub_district,
        district: mOutlets.district,
        city_or_regency: mOutlets.city_or_regency,
        postal_code: mOutlets.postal_code,
        latitude: mOutlets.latitude,
        longitude: mOutlets.longitude,
        outlet_type: mOutlets.outlet_type,
        region: mOutlets.region,
        area: mOutlets.area,
        cycle: mOutlets.cycle,
        is_active: mOutlets.is_active,
        visit_day: mOutlets.visit_day,
        odd_even: mOutlets.odd_even,
        photos: mOutlets.photos,
        remarks: mOutlets.remarks,
      })
      .from(mOutlets)
      .where(eq(mOutlets.is_active, 1))
      .limit(limit)
      .offset((page - 1) * limit);

    if (searchCondition) {
      paginatedQuery = paginatedQuery.where(searchCondition);
    }

    const paginatedResult = await paginatedQuery;
    // Encrypt IDs for the returned data
    const encryptedResult = await Promise.all(
      paginatedResult.map(async (item: { id: number }) => {
        return {
          ...item,
          id: await this.encryptedId(item.id),
        };
      }),
    );

    // Return data with pagination metadata
    return {
      data: encryptedResult,
      totalItems: totalRecords,
      currentPage: page,
      totalPages: Math.ceil(totalRecords / limit),
    };
  }
  // List outlet summary
  async getOutletSummary() {
    const db = this.drizzleService['db'];
    if (!db) {
      throw new Error('Database not initialized');
    }
    // Querying the outlet_summary view
    const result = await db.execute(
      sql`SELECT "REGIONAL", "AREA", "AMO_TYPE_OUTLET", "BRAND_TYPE_OUTLET", "TOTAL" FROM outlet_summary;`,
    );
    return result.rows;
  }
  // List area
  async getOutletArea() {
    const db = this.drizzleService['db'];
    if (!db) {
      throw new Error('Database not initialized');
    }
    // Querying the outlet_area view
    const result = await db.execute(sql`SELECT * FROM outlet_area;`);
    return result.rows.map((row) => row.area);
  }
  // List region
  async getOutletRegion() {
    const db = this.drizzleService['db'];
    if (!db) {
      throw new Error('Database not initialized');
    }
    // Querying the outlet_region view
    const result = await db.execute(
      sql`SELECT region as name FROM outlet_region;`,
    );
    return result.rows.map((row) => row.name);
  }
  // List type sio
  async getOutletTypeSio() {
    const db = this.drizzleService['db'];
    if (!db) {
      throw new Error('Database not initialized');
    }
    // Querying the view using raw SQL
    const result = await db.execute(
      sql`SELECT outlet_type FROM outlet_type_sio;`,
    );
    return result.rows;
  }
  async getOutletByType(region?: string, area?: []) {
    const db = this.drizzleService['db'];
    if (!db) {
      throw new Error('Database not initialized');
    }

    // Start building the query
    let query = db
      .select({
        id: mOutlets.id,
        outlet_code: mOutlets.outlet_code,
        name: mOutlets.name,
        area: mOutlets.area,
        region: mOutlets.region,
      })
      .from(mOutlets)
      .where(eq(mOutlets.is_active, 1));

    if (region) {
      query = query.where(eq(mOutlets.region, region));
    }

    if (area && area.length > 0) {
      console.log(area.length);
      area.map((a) => {
        console.log(a);
        query = query.where(eq(mOutlets.area, a));
      });
    }
    console.log(query);
    console.log('this area', area);
    const res = await query;
    // console.log(res);
    return res;
  }
}
