import {
  pgTable,
  serial,
  varchar,
  timestamp,
  integer,
  date,
} from 'drizzle-orm/pg-core';
import { mUser } from './m_user.schema';
import { relations } from 'drizzle-orm';
export const CallPlan = pgTable('call_plan', {
  id: serial('id').primaryKey().notNull(),
  user_id: integer('user_id').references(() => mUser.id),
  code_call_plan: varchar('code_call_plan', { length: 20 }).notNull(),
  area: varchar('area', { length: 20 }).notNull(),
  region: varchar('region', { length: 20 }).notNull(),
  start_plan: date('start_plan').notNull(),
  end_plan: date('end_plan').notNull(),
  created_by: varchar('created_by', { length: 50 }),
  created_at: timestamp('created_at').defaultNow(),
  updated_by: varchar('updated_by', { length: 50 }),
  updated_at: timestamp('updated_at').defaultNow(),
  deleted_by: varchar('deleted_by', { length: 50 }),
  deleted_at: timestamp('deleted_at').default(null),
});

export const usersCallPlanRelations = relations(CallPlan, ({ one, many }) => ({
  userCallPlan: one(mUser, {
    fields: [CallPlan.user_id],
    references: [mUser.id],
  }),
  callPlan: many(CallPlan),
}));
