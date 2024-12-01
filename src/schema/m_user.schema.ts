import {
  integer,
  pgTable,
  timestamp,
  varchar,
  jsonb,
} from 'drizzle-orm/pg-core';
import { mUserRoles } from './m_user_role.schema';
import { serial } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const mUser = pgTable('m_user', {
  id: serial('id').primaryKey().notNull(),
  username: varchar('username', { length: 100 }).notNull(),
  user_role_id: integer('user_role_id')
    .references(() => mUserRoles.id)
    .notNull(),
  fullname: varchar('fullname', { length: 200 }),
  password: varchar('password', { length: 200 }),
  email: varchar('email', { length: 200 }),
  phone: varchar('phone', { length: 50 }),
  type_md: varchar('type_md', { length: 50 }),
  photo: varchar('photo', { length: 255 }),
  area: jsonb('area').default([]),
  region: varchar('region', { length: 200 }).default(null),
  is_active: integer('is_active').notNull().default(1),
  valid_from: timestamp('valid_from'),
  valid_to: timestamp('valid_to'),
  remember_token: varchar('remember_token', { length: 500 }),
  refresh_token: varchar('refresh_token', { length: 500 }),
  last_login: timestamp('last_login'),
  created_by: varchar('created_by', { length: 100 }),
  created_at: timestamp('created_at').defaultNow(),
  updated_by: varchar('updated_by', { length: 100 }),
  updated_at: timestamp('updated_at').defaultNow(),
  deleted_by: varchar('deleted_by', { length: 100 }),
  deleted_at: timestamp('deleted_at').default(null),
});

export const usersRelations = relations(mUser, ({ one }) => ({
  Roles: one(mUserRoles, {
    fields: [mUser.user_role_id],
    references: [mUserRoles.id],
  }),
}));
