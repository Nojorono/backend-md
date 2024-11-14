import {
  pgTable,
  serial,
  varchar,
  timestamp,
  jsonb,
} from 'drizzle-orm/pg-core';
export const MBrand = pgTable('m_brand', {
  id: serial('id').primaryKey().notNull(),
  brand: varchar('brand', { length: 50 }).unique().notNull(),
  sog: jsonb('sog').default([]),
  created_by: varchar('created_by', { length: 50 }),
  created_at: timestamp('created_at').defaultNow(),
  updated_by: varchar('updated_by', { length: 50 }),
  updated_at: timestamp('updated_at').defaultNow(),
  deleted_by: varchar('deleted_by', { length: 50 }),
  deleted_at: timestamp('deleted_at').default(null),
});
