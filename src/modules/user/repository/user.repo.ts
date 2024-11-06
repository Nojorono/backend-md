import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../../../common/services/drizzle.service';
import { mUser, mUserRoles } from '../../../schema';
import { and, arrayContained, arrayOverlaps, eq, inArray, isNull, sql } from 'drizzle-orm';
import { CreateUserDto, UpdateUserDto } from '../dtos/user.dtos';
import {
  buildSearchQuery,
  decrypt,
  encrypt,
  paginate,
} from '../../../helpers/nojorono.helpers';
import bcrypt from 'bcrypt';
import { raw } from 'express';

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
    user: any,
  ) {
    const db = this.drizzleService['db'];

    if (!db) {
      throw new Error('Database not initialized');
    }

    let getRoles = ['MD', 'TL', 'SUPER-ADMIN', 'ADMIN'];

    if (user.Roles.name == 'TL') {
      getRoles = ['MD'];
    }

    if (user.Roles.name == 'ADMIN') {
      getRoles = ['MD', 'TL'];
    }

    // Query for paginated and filtered results
    const query = db
      .select({
        id: mUser.id,
        user_role_id: mUser.user_role_id,
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
        valid_from: mUser.valid_from,
        valid_to: mUser.valid_to,
      })
      .from(mUser)
      .innerJoin(mUserRoles, eq(mUser.user_role_id, mUserRoles.id))
      .where(
        and(
          eq(mUser.is_active, 1),
          inArray(mUserRoles.name, getRoles),
          isNull(mUser.deleted_at),
        ),
      )
      .orderBy(mUser.updated_at, 'desc');

    // Build search query
    const searchColumns = ['email', 'username', 'phone'];
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
  async createUser(createUserDto: CreateUserDto, userEmail: string) {
    const db = this.drizzleService['db'];
    return await db
      .insert(mUser)
      .values({
        username: createUserDto.username,
        user_role_id: createUserDto.user_role_id,
        fullname: createUserDto.fullname,
        password: await bcrypt.hash('123456', 10), // Hash the password,
        email: createUserDto.email,
        phone: createUserDto.phone,
        area: createUserDto.area,
        region: createUserDto.region,
        type_md: createUserDto.type_md,
        is_active: 1,
        valid_from: new Date(createUserDto.valid_from),
        valid_to: new Date(createUserDto.valid_to),
        created_at: new Date(),
        created_by: userEmail,
        updated_at: new Date(),
        updated_by: userEmail,
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
    console.log(idDecrypted);
    const db = this.drizzleService['db'];
    return await db
      .update(mUser)
      .set({ deleted_at: new Date(), is_active: 0 })
      .where(eq(mUser.id, idDecrypted))
      .execute();
  }

  async getUserWithRole(region?: string, area?: any) {
    const db = this.drizzleService['db'];
    const conditions = [];

    if (region && region !== 'ALL') {
      conditions.push(eq(mUser.region, region));
    }

    // if (area && Array.isArray(area) && area.length > 0) {
    //   console.log(area);
    //   conditions.push(inArray(mUser.area, ['SEMARANG']));
    // }

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
      .where(and(eq(mUserRoles.name, 'MD'), ...conditions))
      .execute();

    console.log('test', query);
    return query;
  }
}
