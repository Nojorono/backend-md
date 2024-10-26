import { Injectable } from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
import { mOutlets } from '../../../schema';
import { DrizzleService } from '../../../common/services/drizzle.service';
import { CreateOutletDto, UpdateOutletDto } from '../dtos/outlet.dtos';
import {
  buildSearchQuery,
  decrypt,
  encrypt,
  paginate,
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
        city_or_regency: createOutletDto.city_or_regency || '', // Using default value if undefined
        postal_code: createOutletDto.postal_code,
        latitude: createOutletDto.latitude || '', // Using default value if undefined
        longitude: createOutletDto.longitude || '', // Using default value if undefined
        outlet_type: createOutletDto.outlet_type || '', // Using default value if undefined
        region: createOutletDto.region || '', // Using default value if undefined
        area: createOutletDto.area || '', // Using default value if undefined
        cycle: createOutletDto.cycle || '', // Using default value if undefined
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

    const result = await db
      .update(mOutlets)
      .set({ deleted_at: new Date(), deleted_by: 'admin', is_active: 0 }) // assuming these fields exist
      .where(eq(mOutlets.id, id))
      .returning();
    return result;
  }
  // List all active outlets with pagination and search
  async getAllActiveOutlets(
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
      .from(mOutlets)
      .where(eq(mOutlets.is_active, 1))
      .execute();

    const totalRecords = parseInt(totalRecordsQuery[0]?.count) || 0;

    const { offset } = paginate(totalRecords, page, limit);

    // Build search query
    const searchColumns = ['name', 'outlet_code'];
    const searchCondition = buildSearchQuery(searchTerm, searchColumns);

    // Query for paginated and filtered results
    const query = db
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
      .limit(limit) // Specify your limit
      .offset(offset);

    // Apply search condition if available
    if (searchCondition) {
      query.where(searchCondition);
    }

    const result = await query.execute();

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
      ...paginate(totalRecords, page, limit), // Return pagination metadata
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
    const result = await db.execute(sql`SELECT area as name FROM outlet_area;`);
    return result.rows;
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
    return result.rows;
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
}
