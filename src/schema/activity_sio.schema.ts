import {
  pgTable,
  serial,
  varchar,
  timestamp,
  integer,
} from 'drizzle-orm/pg-core';
import { Activity } from './activity.schema';
import { relations } from 'drizzle-orm';

export const ActivitySio = pgTable('activity_sio', {
  id: serial('id').primaryKey().notNull(),
  activity_id: integer('activity_id').references(() => Activity.id),
  name: varchar('name', { length: 50 }).notNull(),
  description: varchar('description', { length: 255 }),
  notes: varchar('notes', { length: 255 }),
  photo: varchar('photo', { length: 255 }),
  created_by: varchar('created_by', { length: 100 }),
  created_at: timestamp('created_at').defaultNow(),
  updated_by: varchar('updated_by', { length: 100 }),
  updated_at: timestamp('updated_at').defaultNow(),
  deleted_by: varchar('deleted_by', { length: 100 }),
  deleted_at: timestamp('deleted_at').default(null),
});

export const ActivityRelations = relations(Activity, ({ many }) => ({
  activitySios: many(ActivitySio),
}));

export const ActivitySioRelations = relations(ActivitySio, ({ one }) => ({
  activity: one(Activity, {
    fields: [ActivitySio.activity_id],
    references: [Activity.id],
  }),
}));
