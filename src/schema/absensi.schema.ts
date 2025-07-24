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
    longitudeIn: varchar('longitude_in', { length: 255 }).default(''),
    latitudeIn: varchar('latitude_in', { length: 255 }).default(''),
    longitudeOut: varchar('longitude_out', { length: 255 }).default(''),
    latitudeOut: varchar('latitude_out', { length: 255 }).default(''),
    photoIn: varchar('photo_in', { length: 255 }).default(''),
    photoOut: varchar('photo_out', { length: 255 }).default(''),
  },
  (table) => ({
    userDateIdx: unique().on(table.userId, table.clockIn, table.clockOut),
  }),
);

export const absensiRelations = relations(Absensi, ({ one }) => ({
  user: one(mUser, {
    fields: [Absensi.userId],
    references: [mUser.id],
  }),
}));

