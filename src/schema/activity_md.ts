import {
  pgTable,
  serial,
  varchar,
  timestamp,
  integer,
} from 'drizzle-orm/pg-core';
import { mUser } from './m_user.schema';
import { CallPlan } from './call_plan';
import { mOutlets } from './m_outlet.schema';
import { CallPlanSchedule } from './call_plan_schedule';
export const ActivityMd = pgTable('activity_md', {
  id: serial('id').primaryKey().notNull(),
  user_id: integer('user_id').references(() => mUser.id),
  call_plan_id: integer('call_plan_id')
    .references(() => CallPlan.id)
    .notNull(),
  call_plan_schedule_id: integer('call_plan_schedule_id')
    .references(() => CallPlanSchedule.id)
    .notNull(),
  outlet_id: integer('outlet_id')
    .references(() => mOutlets.id)
    .notNull(),
  code_outlet: varchar('code_outlet', { length: 20 }).notNull(),
  code_call_plan: varchar('code_call_plan', { length: 20 }).notNull(),
  status: varchar('status').notNull(),
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
