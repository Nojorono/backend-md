import {
  pgTable,
  serial,
  varchar,
  timestamp,
  integer,
} from 'drizzle-orm/pg-core';
import { ActivityMd } from './activity_md';

export const ActivityMdDetail = pgTable('activity_md_detail', {
  id: serial('id').primaryKey().notNull(),
  activity_id: integer('activity_id').references(() => ActivityMd.id), // Ensure this is integer and not null
  name: varchar('name', { length: 30 }).notNull(),
  description: varchar('description', { length: 255 }),
  notes: varchar('notes', { length: 255 }),
  photo: varchar('photo', { length: 255 }),
  created_by: varchar('created_by', { length: 50 }),
  created_at: timestamp('created_at').defaultNow(),
  updated_by: varchar('updated_by', { length: 50 }),
  updated_at: timestamp('updated_at').defaultNow(),
  deleted_by: varchar('deleted_by', { length: 50 }),
  deleted_at: timestamp('deleted_at').default(null),
});
