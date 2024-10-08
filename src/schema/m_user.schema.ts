import { bigint, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';
import { mUserRoles } from './m_user_roles.schema';
import { serial } from 'drizzle-orm/pg-core';

export const mUser = pgTable('m_user', {
  id: serial('id').primaryKey().notNull(),
  username: varchar('username', { length: 30 }).notNull(),
  user_role_id: bigint('user_role_id', { mode: 'number' }).references(
    () => mUserRoles.id,
  ),
  fullname: varchar('fullname', { length: 50 }),
  password: varchar('password', { length: 100 }),
  email: varchar('email', { length: 60 }),
  phone: varchar('phone', { length: 20 }),
  tipe_md: varchar('tipe_md', { length: 20 }),
  is_active: varchar('is_active', { length: 1 }).default('Y').notNull(), // Enum 'Y' or 'N'
  is_android: varchar('is_android', { length: 1 }).default('Y').notNull(), // Enum 'Y' or 'N'
  is_web: varchar('is_web', { length: 1 }).default('Y').notNull(), // Enum 'Y' or 'N'
  valid_from: timestamp('valid_from'),
  valid_to: timestamp('valid_to'),
  remember_token: varchar('remember_token', { length: 100 }),
  last_login: timestamp('last_login'),
  created_by: varchar('created_by', { length: 20 }),
  created_at: timestamp('created_at').defaultNow(),
  update_by: varchar('update_by', { length: 20 }),
  updated_at: timestamp('updated_at').defaultNow(),
  deleted_by: varchar('deleted_by', { length: 20 }),
  deleted_at: timestamp('deleted_at').defaultNow(),
});
