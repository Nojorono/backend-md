import { pgTable, serial, text, timestamp, integer, uuid, boolean } from 'drizzle-orm/pg-core';

export const Comments = pgTable('comments', {
  id: serial('id').primaryKey(),
  content: text('content').notNull(),
  user_id: integer('user_id').notNull(), // ref to user table
  activity_id: integer('activity_id').notNull(), // ref to activity table
  outlet_id: integer('outlet_id').notNull(), // ref to outlet table
  created_at: timestamp('created_at').defaultNow(),
  is_liked: boolean('is_liked').default(false), // ref to like table
  notification_identifier: uuid('notification_identifier') // ref to notification table
});
