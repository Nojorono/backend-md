import {
  pgTable,
  serial,
  varchar,
  timestamp,
  integer,
  jsonb,
} from 'drizzle-orm/pg-core';
import { mUser } from './m_user.schema';
import { CallPlan } from './call_plan';
import { mOutlets } from './m_outlet.schema';
import { CallPlanSchedule } from './call_plan_schedule';
import { Survey } from './survey.schema';
export const Activity = pgTable('activity', {
  id: serial('id').primaryKey().notNull(),
  user_id: integer('user_id').references(() => mUser.id),
  call_plan_id: integer('call_plan_id')
    .references(() => CallPlan.id)
    .notNull(),
  call_plan_schedule_id: integer('call_plan_schedule_id')
    .references(() => CallPlanSchedule.id)
    .notNull(),
  outlet_id: integer('outlet_id').references(() => mOutlets.id),
  survey_outlet_id: integer('survey_outlet_id').references(() => Survey.id),
  status: integer('status'),
  area: varchar('area', { length: 100 }).notNull(),
  region: varchar('region', { length: 100 }).notNull(),
  brand: varchar('brand', { length: 100 }).notNull(),
  type_sio: varchar('type_sio', { length: 100 }).notNull(),
  photos: jsonb('photos').default([]),
  start_time: timestamp('start_time').notNull(),
  end_time: timestamp('end_time').notNull(),
  created_by: varchar('created_by', { length: 100 }),
  created_at: timestamp('created_at').defaultNow(),
  updated_by: varchar('updated_by', { length: 100 }),
  updated_at: timestamp('updated_at').defaultNow(),
  deleted_by: varchar('deleted_by', { length: 100 }),
  deleted_at: timestamp('deleted_at').default(null),
});
