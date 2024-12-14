import { z } from 'zod';
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

export const Absensi = pgTable(
  'absensi',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => mUser.id),
    date: date('date').notNull(),
    status: varchar('status', { length: 255 }).default(''),
    remarks: varchar('remarks', { length: 500 }).default(''),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .notNull()
      .$onUpdateFn(() => new Date()),
    clockIn: timestamp('clock_in').default(null),
    clockOut: timestamp('clock_out').default(null),
    area: varchar('area', { length: 255 }).default(''),
    region: varchar('region', { length: 255 }).default(''),
  },
  (table) => ({
    userDateIdx: unique().on(table.userId, table.date),
  }),
);

// Validation schema using Zod
export const absensiValidationSchema = z.object({
  userId: z.number().min(1),
  date: z.date(),
  status: z.string().min(1).optional(),
  remarks: z.string().max(500).optional(),
  clockIn: z.date().optional(),
  clockOut: z.date().optional(),
});

export const absensiRelations = relations(Absensi, ({ one }) => ({
  user: one(mUser, {
    fields: [Absensi.userId],
    references: [mUser.id],
  }),
}));

