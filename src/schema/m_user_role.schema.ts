import {
  pgTable,
  serial,
  varchar,
  timestamp,
  integer,
} from 'drizzle-orm/pg-core';
export const mUserRoles = pgTable('m_user_role', {
  id: serial('id').primaryKey().notNull(),
  name: varchar('name', { length: 20 }).notNull(),
  description: varchar('description', { length: 255 }).notNull(),
  created_by: varchar('created_by', { length: 50 }),
  created_at: timestamp('created_at').defaultNow(),
  updated_by: varchar('updated_by', { length: 50 }),
  updated_at: timestamp('updated_at').defaultNow(),
  is_active: integer('is_active').notNull().default(1),
  is_mobile: integer('is_mobile').notNull().default(0),
  is_web: integer('is_web').notNull().default(0),
});
