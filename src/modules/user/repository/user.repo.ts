import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../../../common/services/drizzle.service';
import { mUser, mUserRoles } from '../../../schema';
import { and, eq, sql } from 'drizzle-orm';
import { CreateUserDto, UpdateUserDto } from '../dtos/user.dtos';
import {
  buildSearchQuery,
  decrypt,
  encrypt,
  paginate,
} from '../../../helpers/nojorono.helpers';
import bcrypt from 'bcrypt';

@Injectable()
export class UserRepo {
  constructor(private readonly drizzleService: DrizzleService) {}
  async decryptId(id: string) {
    const stringId = id.toString();
    return decrypt(stringId);
  }
  async encryptedId(id: number) {
    return encrypt(id.toString());
  }
  // List all active with pagination and search
  async getAllPagination(
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
      .from(mUser)
      .where(eq(mUser.is_active, 1))
      .execute();
    const totalRecords = parseInt(totalRecordsQuery[0]?.count) || 0;

    const { offset } = paginate(totalRecords, page, limit);

    // Build search query
    const searchColumns = ['username', 'email'];
    const searchCondition = buildSearchQuery(searchTerm, searchColumns);

    // Query for paginated and filtered results
    const query = db
      .select({
        id: mUser.id,
        roles: mUserRoles.name,
        username: mUser.username,
        email: mUser.email,
        phone: mUser.phone,
        fullname: mUser.fullname,
        region: mUser.region,
        area: mUser.area,
        type_md: mUser.type_md,
        is_active: mUser.is_active,
        last_login: mUser.last_login,
      })
      .from(mUser)
      .innerJoin(mUserRoles, eq(mUser.user_role_id, mUserRoles.id))
      .where(eq(mUser.is_active, 1))
      .limit(limit)
      .offset(offset);

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
  // Create a new user
  async createUser(createUserDto: CreateUserDto) {
    const db = this.drizzleService['db'];
    const idDecrypted = await this.decryptId(createUserDto.user_role_id);
    return await db
      .insert(mUser)
      .values({
        username: createUserDto.username,
        user_role_id: idDecrypted,
        fullname: createUserDto.fullname,
        password: await bcrypt.hash('123456', 10), // Hash the password,
        email: createUserDto.email,
        phone: createUserDto.phone,
        tipe_md: createUserDto.type_md,
        is_active: createUserDto.is_active ?? true,
        valid_from: createUserDto.valid_from,
        valid_to: createUserDto.valid_to,
      })
      .execute();
  }

  // Read user by ID
  async getUserById(id: string) {
    const idDecrypted = await this.decryptId(id);
    const db = this.drizzleService['db'];
    const query = await db
      .select({
        id: mUser.id,
        roles: mUserRoles.name,
        username: mUser.username,
        email: mUser.email,
        phone: mUser.phone,
        password: mUser.password,
        fullname: mUser.fullname,
        region: mUser.region,
        area: mUser.area,
        type_md: mUser.type_md,
        is_active: mUser.is_active,
        last_login: mUser.last_login,
      })
      .from(mUser)
      .innerJoin(mUserRoles, eq(mUser.user_role_id, mUserRoles.id))
      .where(eq(mUser.id, idDecrypted))
      .execute();

    if (query.length > 0) {
      const user = query[0];
      const encryptedId = await this.encryptedId(user.id);
      return {
        ...user,
        id: encryptedId,
      };
    }
    return null;
  }

  async findByToken(token: string) {
    const db = this.drizzleService['db'];
    const user = await db.query.mUser.findFirst({
      where: (mUser, { eq }) => eq(mUser.remember_token, token),
      with: {
        Roles: true,
      },
    });

    if (user) {
      const encryptedId = await this.encryptedId(user.id);
      return {
        ...user,
        id: encryptedId,
      };
    }
    return null;
  }
  // Read user by Email
  async getUserByEmail(email: string) {
    const db = this.drizzleService['db'];
    const user = await db.query.mUser.findFirst({
      where: (mUser, { eq }) => eq(mUser.email, email),
      with: {
        Roles: true,
      },
    });

    if (user) {
      const encryptedId = await this.encryptedId(user.id);
      return {
        ...user,
        id: encryptedId,
      };
    }
    return null;
  }

  // Update user by ID
  async updateUser(id: string, updateUserDto: UpdateUserDto) {
    const idDecrypted = await this.decryptId(id);
    const db = this.drizzleService['db'];
    return await db
      .update(mUser)
      .set(updateUserDto)
      .where(eq(mUser.id, idDecrypted))
      .execute();
  }

  // Delete user by ID
  async softDeleteUser(id: string) {
    const idDecrypted = await this.decryptId(id);
    const db = this.drizzleService['db'];
    const currentTimestamp = new Date();
    return await db
      .update(mUser)
      .set({ deleted_at: currentTimestamp })
      .where(eq(mUser.id, idDecrypted))
      .execute();
  }

  async getUserWithRole(region?: string, area?: string) {
    const db = this.drizzleService['db'];
    const conditions = [];

    // Add region condition only if region is provided and is not "ALL"
    if (region && region !== 'ALL') {
      conditions.push(eq(mUser.region, region));
    }

    if (area && area !== 'ALL') {
      conditions.push(eq(mUser.area, area));
    }

    return await db
      .select(mUser.id, mUser.email, mUserRoles.name)
      .from(mUser)
      .leftJoin(mUserRoles, eq(mUser.user_role_id, mUserRoles.id))
      .where(and(...conditions))
      .execute();
  }
}
