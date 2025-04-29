import { Injectable } from '@nestjs/common';
import { and, count, eq, isNull, sql } from 'drizzle-orm';
import { mOutlets, MSioType } from '../../../schema';
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

    return await db
      .insert(mOutlets)
      .values({
        ...createOutletDto,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returning();
  }
  // Update Outlet by ID
  async updateOutlet(id: number, updateOutletDto: UpdateOutletDto) {
    console.log(updateOutletDto);
    const db = this.drizzleService['db'];
    return await db
      .update(mOutlets)
      .set({...updateOutletDto, updated_at: new Date()})
      .where(eq(mOutlets.id, id))
      .execute();
  }
  // Update Outlet Status by ID
  async updateOutletStatus(id: number, updateOutletDto: UpdateOutletDto) {
    const db = this.drizzleService['db'];
    return await db
      .update(mOutlets)
      .set(updateOutletDto)
      .where(eq(mOutlets.id, id))
      .execute();
  }
  // Get outlet by id
  async getOutletById(id: string) {
    const db = this.drizzleService['db'];
    if (!db) {
      throw new Error('Database not initialized');
    }
    const idDecrypted = await this.decryptId(id);
    const result = await db.query.mOutlets.findFirst({
      where: eq(mOutlets.id, idDecrypted),
      with: {
        activities: {
          orderBy: (Activity, { desc }) => [desc(Activity.created_at)],
          with: {
            comments: {
              orderBy: (Comment, { desc }) => [desc(Comment.created_at)],
            },
          },
        },
      },
    });
    return result;
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

  async findByCode(code: string) {
    const db = this.drizzleService['db'];
    if (!db) {
      throw new Error('Database not initialized');
    }
    return await db.query.mOutlets.findFirst({ where: eq(mOutlets.outlet_code, code) });
  }

  async getAllActiveOutlets(
    page: number = 1,
    limit: number = 10,
    searchTerm: string = '',
    isActive: number = 1,
    filter: { area: string; region: string; brand: string; sio_type: string },
  ) {
    const db = this.drizzleService['db'];

    if (!db) {
      throw new Error('Database not initialized');
    }

    // Base conditions
    const baseConditions = [
      isNull(mOutlets.deleted_at),
      eq(mOutlets.is_active, isActive)
    ];

    // Add filter conditions
    if (filter.region) {
      baseConditions.push(eq(mOutlets.region, filter.region));
    }

    if (filter.area) {
      baseConditions.push(eq(mOutlets.area, filter.area));
    }
    if (filter.brand) {
      baseConditions.push(eq(mOutlets.brand, filter.brand));
    }
    if (filter.sio_type) {
      baseConditions.push(eq(mOutlets.sio_type, filter.sio_type));
    }

    // Define the search columns and build search condition
    const searchColumns = [
      'name', 
      'address_line', 
      'area', 
      'region', 
      'outlet_code',
      'district'
    ];
    const searchCondition = buildSearchQuery(searchTerm, searchColumns);
    if (searchCondition) {
      baseConditions.push(searchCondition);
    }

    // Count query for total records with all conditions
    const totalRecordsResult = await db
      .select({ count: count() })
      .from(mOutlets)
      .where(and(...baseConditions));

    const totalRecords = totalRecordsResult[0]?.count ?? 0;

    // Paginated data query with optimized field selection
    const paginatedResult = await db
      .select({
        id: mOutlets.id,
        outlet_code: mOutlets.outlet_code,
        name: mOutlets.name,
        brand: mOutlets.brand,
        address_line: mOutlets.address_line,
        sub_district: mOutlets.sub_district,
        district: mOutlets.district,
        latitude: mOutlets.latitude,
        longitude: mOutlets.longitude,
        sio_type: mOutlets.sio_type,
        region: mOutlets.region,
        area: mOutlets.area,
        cycle: mOutlets.cycle,
        is_active: mOutlets.is_active,
        visit_day: mOutlets.visit_day,
        odd_even: mOutlets.odd_even,
        photos: mOutlets.photos,
        remarks: mOutlets.remarks,
        created_at: mOutlets.created_at,
        updated_at: mOutlets.updated_at
      })
      .from(mOutlets)
      .where(and(...baseConditions))
      .orderBy(mOutlets.created_at)
      .limit(limit)
      .offset((page - 1) * limit);

    // Encrypt IDs for the returned data
    const encryptedResult = await Promise.all(
      paginatedResult.map(async (item: { id: number }) => ({
        ...item,
        id: await this.encryptedId(item.id),
      }))
    );

    // Return data with pagination metadata
    return {
      data: encryptedResult,
      totalItems: totalRecords,
      currentPage: page,
      totalPages: Math.ceil(totalRecords / limit),
      limit,
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
      sql`SELECT regional, area, brand, sio_type, brand_type_sio, brand_type_outlet FROM outlet_summary;`,
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
  async getOutletByType(region?: string, area?: string) {
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
        sio_type: mOutlets.sio_type,
        brand: mOutlets.brand,
        address_line: mOutlets.address_line,
        sub_district: mOutlets.sub_district,
        district: mOutlets.district,
        latitude: mOutlets.latitude,
        longitude: mOutlets.longitude,
        visit_day: mOutlets.visit_day,
      })
      .from(mOutlets)
      .where(eq(mOutlets.is_active, 1));

    if (region) {
      query = query.where(eq(mOutlets.region, region));
    }

    if (area) {
      query = query.where(eq(mOutlets.area, area));
    }
    
    return await query;
  }

  async getAll(region: string, area: string) {
    const db = this.drizzleService['db'];

    if (!db) {
      throw new Error('Database not initialized');
    }

    const data = await db
      .select()
      .from(mOutlets)
      .where(and(eq(mOutlets.is_active, 0)));
    return {
      data,
    };
  }

  async getOutletByFilter(query: { region: string, area: string, brand: string, sio_type: string }) {
    const db = this.drizzleService['db'];
    if (!db) {
      throw new Error('Database not initialized');
    }
    const result = await db.query.mOutlets.findMany({
      where: and(
        eq(mOutlets.is_active, 1),
        eq(mOutlets.region, query.region),
        eq(mOutlets.area, query.area),
        eq(mOutlets.brand, query.brand),
        eq(mOutlets.sio_type, query.sio_type)
      )
    });
    return result;
  }
}

