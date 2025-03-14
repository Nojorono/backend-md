import {
    pgTable,
    serial,
    varchar,
    timestamp,
    integer,
  } from 'drizzle-orm/pg-core';
  import { Activity } from './activity.schema';
  import { relations } from 'drizzle-orm';
  
  export const ActivityProgram = pgTable('activity_program', {
    id: serial('id').primaryKey().notNull(),
    activity_id: integer('activity_id').references(() => Activity.id),
    name: varchar('name', { length: 50 }).notNull(),
    description: varchar('description', { length: 255 }),
    photo: varchar('photo', { length: 255 }),
    created_by: varchar('created_by', { length: 100 }),
    created_at: timestamp('created_at').defaultNow(),
    updated_by: varchar('updated_by', { length: 100 }),
    updated_at: timestamp('updated_at').defaultNow(),
    deleted_by: varchar('deleted_by', { length: 100 }),
    deleted_at: timestamp('deleted_at').default(null),
  });
  
  export const ActivityProgramRelations = relations(ActivityProgram, ({ one }) => ({
    activity: one(Activity, {
      fields: [ActivityProgram.activity_id],
      references: [Activity.id],
    }),
  }));
  