import { pgTable, serial, varchar, timestamp, date } from 'drizzle-orm/pg-core';
export const Mbatch = pgTable('m_batch', {
  id: serial('id').primaryKey().notNull(),
  code_batch: varchar('code_batch', { length: 20 }).unique().notNull(),
  start_plan: date('start_plan').notNull(),
  end_plan: date('end_plan').notNull(),
  created_by: varchar('created_by', { length: 100 }),
  created_at: timestamp('created_at').defaultNow(),
  updated_by: varchar('updated_by', { length: 100 }),
  updated_at: timestamp('updated_at').defaultNow(),
  deleted_by: varchar('deleted_by', { length: 100 }),
  deleted_at: timestamp('deleted_at').default(null),
});
