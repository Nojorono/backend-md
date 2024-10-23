import {
  pgTable,
  serial,
  varchar,
  timestamp,
  integer,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { mUser } from './m_user.schema';
export const statusEnum = pgEnum('activity_status', [
  'default',
  'survey',
  'submitted',
  'pending',
  'clear',
  'reject',
]);
export const ActivityMd = pgTable('activity_md', {
  id: serial('id').primaryKey().notNull(),
  user_id: integer('user_id').references(() => mUser.id), // Ensure this is integer and not null
  code_outlet: varchar('code_outlet', { length: 20 }).notNull(),
  code_call_plan: varchar('code_call_plan', { length: 20 }).notNull(),
  status: statusEnum('status').notNull(),
  area: varchar('area', { length: 20 }).notNull(),
  region: varchar('region', { length: 20 }).notNull(),
  brand: varchar('brand', { length: 20 }).notNull(),
  type_sio: varchar('type_sio', { length: 25 }).notNull(),
  brand_type_sio: varchar('brand_type_sio', { length: 50 }).notNull(),
  amo_brand_type_sio: varchar('amo_brand_type_sio', { length: 50 }).notNull(),
  start_time: timestamp('start_time').notNull(),
  end_time: timestamp('end_time').notNull(),
  created_by: varchar('created_by', { length: 50 }),
  created_at: timestamp('created_at').defaultNow(),
  updated_by: varchar('updated_by', { length: 50 }),
  updated_at: timestamp('updated_at').defaultNow(),
  deleted_by: varchar('deleted_by', { length: 50 }),
  deleted_at: timestamp('deleted_at').default(null),
});
