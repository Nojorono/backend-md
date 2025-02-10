import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../../../common/services/drizzle.service';
import { mUser, mUserRoles } from '../../../schema';
import {
  and,
  arrayContained,
  arrayOverlaps,
  eq,
  inArray,
  isNull,
  not,
  notInArray,
  or,
} from 'drizzle-orm';
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

  async findById(id: number) {
    const db = this.drizzleService['db'];
    return await db.query.mUser.findFirst({
      where: (mUser, { eq }) => eq(mUser.id, id),
    });
  }

  async findIdUserRegionArea(email: any, region?: string, area?: string) {
    const db = this.drizzleService['db'];
    const conditions = [];

    conditions.push(isNull(mUser.deleted_at));
    conditions.push(not(eq(mUser.email, email)));
    if (region) {
      conditions.push(or(isNull(mUser.region), eq(mUser.region, region)));
    }
    if (area) {
      conditions.push(
        or(isNull(mUser.area), arrayContained(mUser.area, [area])),
      );
    }

    const query = db
      .select()
      .from(mUser)
      .where(and(...conditions));
    const result = await query.execute();

    return result;

    // // Encrypt IDs in the result
    // const encryptedResult = await Promise.all(
    //   result.map(async (item: { id: number; [key: string]: any }) => ({
    //     ...item,
    //     id: await this.encryptedId(item.id),
    //   })),
    // );

    // return encryptedResult;
  }

  // List all active users with pagination and search
  async getAllPagination(
    page: number = 1,
    limit: number = 10,
    searchTerm: string = '',
    filter: { area: string; region: string },
    user: any,
  ) {
    const db = this.drizzleService['db'];

    if (!db) {
      throw new Error('Database not initialized');
    }
    const conditions = [];

    // Define role-based access hierarchy
    const roleHierarchy = {
      TL: ['MD'],
      AMO: ['MD', 'TL'],
      REGIONAL: ['MD', 'TL', 'AMO'],
      NASIONAL: ['MD', 'TL', 'AMO', 'REGIONAL'],
      ADMIN: ['MD', 'TL', 'AMO', 'REGIONAL', 'NASIONAL'],
      SUPERADMIN: ['MD', 'TL', 'AMO', 'REGIONAL', 'NASIONAL', 'ADMIN'],
    };

    // Get allowed roles based on user's role
    const allowedRoles = roleHierarchy[user.Roles.name] || [];
    if (allowedRoles.length === 0) {
      allowedRoles.push(user.Roles.name);
    }

    // Build base query with joins
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
      .leftJoin(mUserRoles, eq(mUser.user_role_id, mUserRoles.id));

    // Add base conditions
    conditions.push(eq(mUser.is_active, 1));
    conditions.push(isNull(mUser.deleted_at));
    conditions.push(inArray(mUserRoles.name, allowedRoles));

    // Apply search filters if provided
    const searchColumns = ['email', 'username', 'phone', 'fullname'];
    const searchCondition = buildSearchQuery(searchTerm, searchColumns);
    if (searchCondition) {
      conditions.push(searchCondition);
    }

    // Apply region filter if provided
    if (filter.region && filter.region !== '') {
      conditions.push(eq(mUser.region, filter.region));
    }

    // Apply area filter if provided
    if (filter.area && filter.area !== '' && filter.area !== null) {
      if (Array.isArray(filter.area)) {
        conditions.push(arrayContained(mUser.area, filter.area));
      } else {
        conditions.push(arrayContained(mUser.area, [filter.area]));
      }
    }

    // Apply all conditions to query
    query.where(and(...conditions));

    // Get total count for pagination
    const records = await query.execute();
    const totalRecords = records.length;
    const { offset } = paginate(totalRecords, page, limit);

    // Apply pagination
    query.limit(limit).offset(offset);

    // Execute final query
    const result = await query.execute();

    // Encrypt IDs in the result
    const encryptedResult = await Promise.all(
      result.map(async (item: { id: number; [key: string]: any }) => ({
        ...item,
        id: await this.encryptedId(item.id),
      })),
    );

    // Return paginated results with metadata
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
        password: await bcrypt.hash('123456', 10),
        email: createUserDto.email,
        phone: createUserDto.phone,
        area: createUserDto.area,
        region: createUserDto.region,
        type_md: createUserDto.type_md,
        is_active: 1,
        valid_from: createUserDto.valid_from
          ? new Date(createUserDto.valid_from)
          : null,
        valid_to: createUserDto.valid_to
          ? new Date(createUserDto.valid_to)
          : null,
        created_at: new Date(),
        created_by: userEmail,
      })
      .execute();
  }

  async findByIdDecrypted(id: string) {
    const idDecrypted = await this.decryptId(id);
    const db = this.drizzleService['db'];
    if (!db) {
      throw new Error('Database not initialized');
    }
    return await db.query.mUser.findFirst({
      where: (mUser, { eq }) => eq(mUser.id, idDecrypted),
      with: {
        Roles: true,
      },
    });
  }

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
        fullname: mUser.fullname,
        region: mUser.region,
        area: mUser.area,
        type_md: mUser.type_md,
        is_active: mUser.is_active,
        last_login: mUser.last_login,
        remember_token: mUser.remember_token,
        photo: mUser.photo,
        menus: mUserRoles.menus,
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

  // async findByToken(token: string) {
  //   const db = this.drizzleService['db'];
  //   const user = await db.query.mUser.findFirst({
  //     where: (mUser, { eq }) => eq(mUser.remember_token, token),
  //     with: {
  //       Roles: true,
  //     },
  //   });

  //   if (user) {
  //     const encryptedId = await this.encryptedId(user.id);
  //     return {
  //       ...user,
  //       id: encryptedId,
  //     };
  //   }
  //   return null;
  // }

  async findByEmail(email: string) {
    const db = this.drizzleService['db'];
    if (!db) {
      throw new Error('Database not initialized');
    }
    return await db.query.mUser.findFirst({ where: eq(mUser.email, email) });
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
    if (!db) {
      throw new Error('Database not initialized');
    }
    return await db
      .update(mUser)
      .set(updateUserDto)
      .where(eq(mUser.id, idDecrypted))
      .execute();
  }

  // Update user by ID
  async updateUserReturn(id: string, updateUserDto: UpdateUserDto) {
    const idDecrypted = await this.decryptId(id);
    const db = this.drizzleService['db'];

    if (!db) {
      throw new Error('Database not initialized');
    }
    await db
      .update(mUser)
      .set(updateUserDto)
      .where(eq(mUser.id, idDecrypted))
      .execute();
    // Fetch and return the updated record
    const updatedUser = await db
      .select()
      .from(mUser)
      .where(eq(mUser.id, idDecrypted))
      .execute();
    return updatedUser[0];
  }

  // Delete user by ID
  async softDeleteUser(id: string) {
    const idDecrypted = await this.decryptId(id);
    const db = this.drizzleService['db'];
    return await db
      .update(mUser)
      .set({ deleted_at: new Date(), updated_at: new Date(), is_active: 0 })
      .where(eq(mUser.id, idDecrypted))
      .execute();
  }

  async getMdRole(region?: string, area?: string) {
    const db = this.drizzleService['db'];
    const conditions = [];

    if (region) {
      conditions.push(eq(mUser.region, region));
    }

    if (area && area.length > 0) {
      conditions.push(arrayContained(mUser.area, [area]));
    }

    return await db
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
  }
}
