import { pgTable, serial, varchar, timestamp } from 'drizzle-orm/pg-core';

export const mUserRoles = pgTable('m_user_role', {
  id: serial('id').primaryKey().notNull(), // AUTO_INCREMENT equivalent in PostgreSQL
  name: varchar('name', { length: 10 }).notNull(),
  description: varchar('description', { length: 255 }).notNull(),
  is_active: varchar('is_active', { length: 1 }).default('Y').notNull(), // Enum 'Y' or 'N'
  created_by: varchar('created_by', { length: 50 }),
  created_at: timestamp('created_at').defaultNow(),
  updated_by: varchar('updated_by', { length: 50 }),
  updated_at: timestamp('updated_at').defaultNow(),
});
