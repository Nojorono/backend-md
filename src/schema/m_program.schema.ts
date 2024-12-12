import {
    pgTable,
    serial,
    varchar,
    timestamp,
  } from 'drizzle-orm/pg-core';
  export const Program = pgTable('m_program', {
    id: serial('id').primaryKey().notNull(),
    name: varchar('name', { length: 50 }).notNull(),
    description: varchar('description', { length: 255 }),
    notes: varchar('notes', { length: 255 }),
    created_by: varchar('created_by', { length: 100 }),
    created_at: timestamp('created_at').defaultNow(),
    updated_by: varchar('updated_by', { length: 100 }),
    updated_at: timestamp('updated_at').defaultNow(),
    deleted_by: varchar('deleted_by', { length: 100 }),
    deleted_at: timestamp('deleted_at').default(null),
  });
  