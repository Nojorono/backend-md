import { pgTable, serial, text, timestamp, integer } from 'drizzle-orm/pg-core';

export const Comments = pgTable('comments', {
  id: serial('id').primaryKey(),
  content: text('content').notNull(),
  user_id: integer('user_id').notNull(),
  activity_id: integer('activity_id').notNull(),
  created_at: timestamp('created_at').defaultNow(),
  notification_id: integer('notification_id')
});
