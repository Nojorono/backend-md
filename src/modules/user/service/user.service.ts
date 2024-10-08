// src/user/user.service.ts
import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../../../common/services/drizzle.service';
import { mUser, mUserRoles } from '../../../schema';
import { eq } from 'drizzle-orm';
import { CreateUserDto, UpdateUserDto } from '../dtos/user.dtos';

@Injectable()
export class UserService {
  private db: any;

  constructor(private readonly drizzleService: DrizzleService) {
    this.db = this.drizzleService.getDatabase();
  }

  // Create a new user
  async createUser(createUserDto: CreateUserDto) {
    return await this.db
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
  async getUserById(id: number) {
    return await this.db.select().from(mUser).where(eq(mUser.id, id)).execute();
  }

  // Update user by ID
  async updateUser(id: number, updateUserDto: UpdateUserDto) {
    return await this.db
      .update(mUser)
      .set(updateUserDto)
      .where(eq(mUser.id, id))
      .execute();
  }

  // Delete user by ID
  async deleteUser(id: number) {
    return await this.db.delete(mUser).where(eq(mUser.id, id)).execute();
  }

  // Join with user roles and get user by username
  async getUserWithRole(username: string) {
    return await this.db
      .select({
        user: mUser,
        role: mUserRoles,
      })
      .from(mUser)
      .leftJoin(mUserRoles, eq(mUser.user_role_id, mUserRoles.id))
      .where(eq(mUser.username, username))
      .execute();
  }
}
