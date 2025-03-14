import {
  pgTable,
  serial,
  varchar,
  timestamp,
  integer,
  jsonb,
  text,
} from 'drizzle-orm/pg-core';
import { mUser } from './m_user.schema';
import { CallPlan } from './call_plan';
import { mOutlets } from './m_outlet.schema';
import { CallPlanSchedule } from './call_plan_schedule';
import { Survey } from './survey.schema';
import { relations } from 'drizzle-orm';
import { ActivitySio } from './activity_sio.schema';
import { ActivitySog } from './activity_sog.schema';
import { Comments } from './comment.schema';
import { ActivityBranch } from './activity_branch.schema';
import { Program } from './m_program.schema';
import { ActivityProgram } from './activity_program.schema';
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
  program_id: integer('program_id').references(() => Program.id),
  status: integer('status'),
  status_approval: integer('status_approval').default(0),
  area: varchar('area', { length: 100 }).notNull(),
  region: varchar('region', { length: 100 }).notNull(),
  brand: varchar('brand', { length: 100 }).notNull(),
  type_sio: varchar('type_sio', { length: 100 }).notNull(),
  photos: jsonb('photos').default([]),
  start_time: timestamp('start_time').notNull(),
  end_time: timestamp('end_time').notNull(),
  latitude: varchar('latitude', { length: 100 }),
  longitude: varchar('longitude', { length: 100 }),
  notes: text('notes'),
  photo_program: varchar('photo_program', { length: 255 }),
  sale_outlet_weekly: integer('sale_outlet_weekly'),
  created_by: varchar('created_by', { length: 100 }),
  created_at: timestamp('created_at').defaultNow(),
  updated_by: varchar('updated_by', { length: 100 }),
  updated_at: timestamp('updated_at').defaultNow(),
  deleted_by: varchar('deleted_by', { length: 100 }),
  deleted_at: timestamp('deleted_at').default(null),
});

export const outletActivityRelations = relations(Activity, ({ one }) => ({
  outlet: one(mOutlets, {
    fields: [Activity.outlet_id],
    references: [mOutlets.id],
  }),
}));

export const ActivityRelations = relations(Activity, ({ one, many }) => ({
  user: one(mUser, {
    fields: [Activity.user_id],
    references: [mUser.id],
  }),
  callPlan: one(CallPlan, {
    fields: [Activity.call_plan_id],
    references: [CallPlan.id],
  }),
  callPlanSchedule: one(CallPlanSchedule, {
    fields: [Activity.call_plan_schedule_id],
    references: [CallPlanSchedule.id],
  }),
  surveyOutlet: one(Survey, {
    fields: [Activity.survey_outlet_id],
    references: [Survey.id],
  }),
  outlet: one(mOutlets, {
    fields: [Activity.outlet_id],
    references: [mOutlets.id],
  }),
  program: one(Program, {
    fields: [Activity.program_id],
    references: [Program.id],
  }),
  activitySios: many(ActivitySio),
  activitySogs: many(ActivitySog),
  activityBranches: many(ActivityBranch),
  activityPrograms: many(ActivityProgram),
  comments: many(Comments),
}));
