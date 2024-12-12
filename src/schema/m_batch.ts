import { sql } from 'drizzle-orm';
import { index } from 'drizzle-orm/pg-core';
import { pgTable, serial, varchar, timestamp, date } from 'drizzle-orm/pg-core';

export const Mbatch = pgTable('m_batch', {
  id: serial('id').primaryKey().notNull(),
  start_plan: date('start_plan').notNull(),
  end_plan: date('end_plan').notNull(),
  created_by: varchar('created_by', { length: 100 }),
  created_at: timestamp('created_at').defaultNow(),
  updated_by: varchar('updated_by', { length: 100 }),
  updated_at: timestamp('updated_at').defaultNow(),
  deleted_by: varchar('deleted_by', { length: 100 }),
  deleted_at: timestamp('deleted_at').default(null),
  code_batch: varchar('code_batch', { length: 100 }).notNull(),
}, (table) => ({
  uniqueCodeBatch: index('unique_code_batch_active').on(table.code_batch).where(sql`deleted_at IS NULL`)
}));