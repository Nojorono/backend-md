import { pgTable, serial, varchar, timestamp, date } from 'drizzle-orm/pg-core';
import { Mbatch } from './m_batch';
export const CallPlan = pgTable('call_plan', {
  id: serial('id').primaryKey().notNull(),
  code_batch: varchar('code_batch').references(() => Mbatch.code_batch),
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
