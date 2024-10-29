import {
  pgTable,
  serial,
  varchar,
  timestamp,
  integer,
  date,
} from 'drizzle-orm/pg-core';
import { CallPlan } from './call_plan';
import { mOutlets } from './m_outlet.schema';
import { relations } from 'drizzle-orm';
export const CallPlanSchedule = pgTable('call_plan_schedule', {
  id: serial('id').primaryKey().notNull(),
  code_call_plan: varchar('code_call_plan', { length: 20 }).notNull(),
  call_plan_id: integer('call_plan_id')
    .references(() => CallPlan.id)
    .notNull(),
  outlet_id: integer('outlet_id')
    .references(() => mOutlets.id)
    .notNull(),
  start_plan: date('start_plan').notNull(),
  end_plan: date('end_plan').notNull(),
  notes: varchar('notes', { length: 255 }),
  created_by: varchar('created_by', { length: 50 }),
  created_at: timestamp('created_at').defaultNow(),
  updated_by: varchar('updated_by', { length: 50 }),
  updated_at: timestamp('updated_at').defaultNow(),
  deleted_by: varchar('deleted_by', { length: 50 }),
  deleted_at: timestamp('deleted_at').default(null),
});

export const CallPlanScheduleRelations = relations(
  CallPlanSchedule,
  ({ one }) => ({
    callPlan: one(CallPlan, {
      fields: [CallPlanSchedule.call_plan_id], // Foreign key field
      references: [CallPlan.id], // Primary key in CallPlan
    }),
  }),
);

export const CallPlanOutletRelations = relations(
  CallPlanSchedule,
  ({ one }) => ({
    callPlanOutlet: one(mOutlets, {
      fields: [CallPlanSchedule.outlet_id],
      references: [mOutlets.id],
    }),
  }),
);
