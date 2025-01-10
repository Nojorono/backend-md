import {
  pgTable,
  serial,
  varchar,
  date,
  unique,
  timestamp,
  integer,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { mUser } from './m_user.schema';

export const ReimburseBbm = pgTable(
  'reimburse_bbm',
  {
    id: serial('id').primaryKey(),
    user_id: integer('user_id').references(() => mUser.id),
    photo_in: varchar('photo_in', { length: 255 }).default(''),
    photo_out: varchar('photo_out', { length: 255 }).default(''),
    kilometer_in: integer('kilometer_in').default(0),
    kilometer_out: integer('kilometer_out').default(0),
    date_in: timestamp('date_in').defaultNow().notNull(),
    date_out: timestamp('date_out').default(null),
    total_kilometer: integer('total_kilometer').default(0),
    description: varchar('description', { length: 255 }).default(''),
    status: integer('status').default(0),
    approved_by: varchar('approved_by', { length: 100 }).default(''),
    approved_at: timestamp('approved_at').default(null),
  },
  (table) => ({
    userIdx: unique().on(table.user_id),
  }),
);

export const reimburseBbmRelations = relations(ReimburseBbm, ({ one }) => ({
  user: one(mUser, {
    fields: [ReimburseBbm.user_id],
    references: [mUser.id],
  }),
}));

