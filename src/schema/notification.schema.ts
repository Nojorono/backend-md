import { pgTable, serial, text, timestamp, boolean, integer } from 'drizzle-orm/pg-core';

export const Notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  message: text('message').notNull(),
  user_id: integer('user_id').notNull(),
  created_at: timestamp('created_at').defaultNow(),
  is_read: boolean('is_read').default(false)
});