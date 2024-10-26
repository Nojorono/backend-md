import { Injectable } from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
import { mUserRoles } from '../../../schema';
import { DrizzleService } from '../../../common/services/drizzle.service';
import {
  buildSearchQuery,
  decrypt,
  encrypt,
  paginate,
} from '../../../helpers/nojorono.helpers';
import { CreateRolesDto, UpdateRolesDto } from '../dtos/roles.dtos';

@Injectable()
export class RolesRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async decryptId(id: string) {
    const stringId = id.toString();
    return decrypt(stringId);
  }
  async encryptedId(id: number) {
    return encrypt(id.toString());
  }
  // Create Roles
  async createRoles(createRolesDto: CreateRolesDto) {
    const db = this.drizzleService['db'];

    if (!db) {
      throw new Error('Database not initialized');
    }

    return await db
      .insert(mUserRoles)
      .values({
        description: createRolesDto.description,
        name: createRolesDto.name,
        is_active:
          createRolesDto.is_active !== undefined ? createRolesDto.is_active : 1, // Defaulting to 1
        created_by: createRolesDto.created_by,
        updated_by: createRolesDto.updated_by,
        created_at: createRolesDto.created_at || new Date(), // Default to current date
        updated_at: createRolesDto.updated_at || new Date(), // Default to current date
      })
      .returning();
  }

  // Update Roles by ID
  async updateRoles(id: string, updateRolesDto: UpdateRolesDto) {
    const db = this.drizzleService['db'];
    const idDecrypted = await this.decryptId(id);
    console.log(idDecrypted, id);
    console.log(updateRolesDto);

    return await db
      .update(mUserRoles)
      .set(updateRolesDto)
      .where(eq(mUserRoles.id, idDecrypted))
      .execute();
  }

  // Get Roles by id
  async getRolesById(id: number) {
    const db = this.drizzleService['db'];

    if (!db) {
      throw new Error('Database not initialized');
    }

    const result = await db
      .select()
      .from(mUserRoles)
      .where(eq(mUserRoles.id, id));
    return result[0]; // Return the first (and expectedly only) result
  }

  // Get Roles all List
  async getRolesList() {
    const db = this.drizzleService['db'];
    if (!db) {
      throw new Error('Database not initialized');
    }
    return await db.select().from(mUserRoles).execute();
  }

  // Delete an Roles (soft delete by updating is_deleted field)
  async deleteRoles(id: string, userBy: string) {
    const idDecrypted = await this.decryptId(id);
    const db = this.drizzleService['db'];
    if (!db) {
      throw new Error('Database not initialized');
    }
    return await db
      .update(mUserRoles)
      .set({ updated_at: new Date(), updated_by: userBy, is_active: 0 }) // assuming these fields exist
      .where(eq(mUserRoles.id, idDecrypted))
      .returning();
  }

  // List all active Roles with pagination and search
  async getAllActiveRoles(
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
      .from(mUserRoles)
      .where(eq(mUserRoles.is_active, 1))
      .execute();
    const totalRecords = parseInt(totalRecordsQuery[0]?.count) || 0;

    const { offset } = paginate(totalRecords, page, limit);

    // Build search query
    const searchColumns = ['name', 'description'];
    const searchCondition = buildSearchQuery(searchTerm, searchColumns);

    // Query for paginated and filtered results
    const query = db
      .select({
        id: mUserRoles.id,
        name: mUserRoles.name,
        description: mUserRoles.description,
        is_mobile: mUserRoles.is_mobile,
        is_web: mUserRoles.is_web,
        is_active: mUserRoles.is_active,
      })
      .from(mUserRoles)
      .where(eq(mUserRoles.is_active, 1))
      .limit(limit) // Specify your limit
      .offset(offset); // Specify your offset

    // Apply search condition if available
    if (searchCondition) {
      query.where(searchCondition);
    }

    const result = await query;

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
      ...paginate(totalRecords, page, limit),
    };
  }
}
