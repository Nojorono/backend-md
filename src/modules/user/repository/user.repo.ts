import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../../../common/services/drizzle.service';
import { mUser, mUserRoles } from '../../../schema';
import { and, eq, isNull } from 'drizzle-orm';
import { CreateUserDto, UpdateUserDto } from '../dtos/user.dtos';
import { decrypt, encrypt } from '../../../helpers/nojorono.helpers';

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
  // Create a new user
  async createUser(createUserDto: CreateUserDto) {
    const db = this.drizzleService['db'];
    return await db
      .insert(mUser)
      .values({
        username: createUserDto.username,
        user_role_id: createUserDto.user_role_id,
        fullname: createUserDto.fullname,
        password: createUserDto.password,
        email: createUserDto.email,
        phone: createUserDto.phone,
        tipe_md: createUserDto.tipe_md,
        is_active: createUserDto.is_active ?? true,
        is_android: createUserDto.is_android ?? true,
        is_web: createUserDto.is_web ?? true,
        valid_from: createUserDto.valid_from,
        valid_to: createUserDto.valid_to,
      })
      .execute();
  }

  // Read user by ID
  async getUserById(id: string) {
    const idDecrypted = await this.decryptId(id);
    const db = this.drizzleService['db'];
    const data = await db
      .select()
      .from(mUser)
      .where(eq(mUser.id, idDecrypted))
      .execute();
    if (data.length > 0) {
      const user = data[0];
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
    const data = await db
      .select()
      .from(mUser)
      .where(eq(mUser.email, email))
      .execute();
    if (data.length > 0) {
      const user = data[0];
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

  // Join with user roles and get user by username
  async getUserWithRole(username: string) {
    const db = this.drizzleService['db'];
    return await db
      .select({
        user: mUser,
        role: mUserRoles,
      })
      .from(mUser)
      .leftJoin(mUserRoles, eq(mUser.user_role_id, mUserRoles.id))
      .where(and(eq(mUser.username, username), isNull(mUser.deleted_at)))
      .execute();
  }
}
