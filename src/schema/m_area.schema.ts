import {
  pgTable,
  serial,
  varchar,
  timestamp,
  integer,
} from 'drizzle-orm/pg-core';
import { MRegion } from './m_region.schema';
export const MArea = pgTable('m_area', {
  id: serial('id').primaryKey().notNull(),
  region_id: integer('region_id').references(() => MRegion.id),
  area: varchar('area', { length: 150 }),
  created_by: varchar('created_by', { length: 100 }),
  created_at: timestamp('created_at').defaultNow(),
  updated_by: varchar('updated_by', { length: 100 }),
  updated_at: timestamp('updated_at').defaultNow(),
  deleted_by: varchar('deleted_by', { length: 100 }),
  deleted_at: timestamp('deleted_at').default(null),
});
