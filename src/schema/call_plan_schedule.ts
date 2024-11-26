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
import { mUser } from './m_user.schema';
import { Survey } from './survey.schema';
export const CallPlanSchedule = pgTable('call_plan_schedule', {
  id: serial('id').primaryKey().notNull(),
  user_id: integer('user_id').references(() => mUser.id),
  code_call_plan: varchar('code_call_plan', { length: 100 }).notNull(),
  call_plan_id: integer('call_plan_id')
    .references(() => CallPlan.id)
    .notNull(),
  outlet_id: integer('outlet_id').references(() => mOutlets.id),
  survey_outlet_id: integer('survey_outlet_id').references(() => Survey.id),
  day_plan: date('day_plan').notNull(),
  notes: varchar('notes', { length: 255 }),
  status: varchar('status', { length: 20 }).default('scheduled'),
  type: varchar('type', { length: 20 }).default('normal'),
  time_start: timestamp('time_start').default(null),
  time_end: timestamp('time_end').default(null),
  created_by: varchar('created_by', { length: 100 }),
  created_at: timestamp('created_at').defaultNow(),
  updated_by: varchar('updated_by', { length: 100 }),
  updated_at: timestamp('updated_at').defaultNow(),
  deleted_by: varchar('deleted_by', { length: 100 }),
  deleted_at: timestamp('deleted_at').default(null),
});

export const CallPlanOutletRelations = relations(
  CallPlanSchedule,
  ({ one }) => ({
    callPlanOutlet: one(mOutlets, {
      fields: [CallPlanSchedule.outlet_id],
      references: [mOutlets.id],
    }),
  }),
);

export const CallPlanUserRelations = relations(CallPlanSchedule, ({ one }) => ({
  callPlanUser: one(mUser, {
    fields: [CallPlanSchedule.user_id],
    references: [mUser.id],
  }),
}));
