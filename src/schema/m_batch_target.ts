import {
  pgTable,
  serial,
  varchar,
  timestamp,
  integer,
} from 'drizzle-orm/pg-core';
import { Mbatch } from './m_batch';
export const MbatchTarget = pgTable('m_batch_target', {
  id: serial('id').primaryKey().notNull(),
  batch_id: integer('batch_id').references(() => Mbatch.id),
  regional: varchar('regional', { length: 100 }),
  amo: varchar('amo', { length: 100 }),
  brand_type_sio: varchar('brand_type_sio', { length: 100 }),
  amo_brand_type: varchar('amo_brand_type', { length: 100 }),
  allocation_ho: integer('allocation_ho').default(0),
  created_by: varchar('created_by', { length: 50 }),
  created_at: timestamp('created_at').defaultNow(),
  updated_by: varchar('updated_by', { length: 50 }),
  updated_at: timestamp('updated_at').defaultNow(),
  deleted_by: varchar('deleted_by', { length: 50 }),
  deleted_at: timestamp('deleted_at').default(null),
});
