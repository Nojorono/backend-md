import { pgTable, serial, varchar, timestamp } from 'drizzle-orm/pg-core';
export const MRegion = pgTable('m_region', {
  id: serial('id').primaryKey().notNull(),
  name: varchar('name', { length: 150 }).unique().notNull(),
  created_by: varchar('created_by', { length: 100 }),
  created_at: timestamp('created_at').defaultNow(),
  updated_by: varchar('updated_by', { length: 100 }),
  updated_at: timestamp('updated_at').defaultNow(),
  deleted_by: varchar('deleted_by', { length: 100 }),
  deleted_at: timestamp('deleted_at').default(null),
});
