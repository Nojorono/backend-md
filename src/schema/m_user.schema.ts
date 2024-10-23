import { integer, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';
import { mUserRoles } from './m_user_role.schema';
import { serial } from 'drizzle-orm/pg-core';

export const mUser = pgTable('m_user', {
  id: serial('id').primaryKey().notNull(),
  username: varchar('username', { length: 50 }).notNull(),
  user_role_id: integer('user_role_id')
    .references(() => mUserRoles.id)
    .notNull(), // Ensure this is integer and not null
  fullname: varchar('fullname', { length: 50 }),
  password: varchar('password', { length: 100 }),
  email: varchar('email', { length: 60 }),
  phone: varchar('phone', { length: 20 }),
  type_md: varchar('type_md', { length: 20 }),
  is_active: integer('is_active').notNull().default(1),
  valid_from: timestamp('valid_from'),
  valid_to: timestamp('valid_to'),
  remember_token: varchar('remember_token', { length: 500 }),
  last_login: timestamp('last_login'),
  created_by: varchar('created_by', { length: 20 }),
  created_at: timestamp('created_at').defaultNow(),
  updated_by: varchar('updated_by', { length: 20 }),
  updated_at: timestamp('updated_at').defaultNow(),
  deleted_by: varchar('deleted_by', { length: 20 }),
  deleted_at: timestamp('deleted_at').default(null),
});
