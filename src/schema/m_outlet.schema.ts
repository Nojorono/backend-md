import {
  pgTable,
  serial,
  varchar,
  integer,
  timestamp,
  text,
  jsonb,
} from 'drizzle-orm/pg-core';
import { Survey } from './survey.schema';
import { Activity } from './activity.schema';
import { relations } from 'drizzle-orm';

export const mOutlets = pgTable('m_outlet', {
  id: serial('id').primaryKey(),
  outlet_code: varchar('outlet_code', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  brand: varchar('brand', { length: 255 }).notNull(),
  address_line: varchar('address_line', { length: 300 }),
  sub_district: varchar('sub_district', { length: 255 }),
  district: varchar('district', { length: 255 }),
  latitude: varchar('latitude', { length: 225 }),
  longitude: varchar('longitude', { length: 225 }),
  sio_type: varchar('sio_type', { length: 50 }),
  region: varchar('region', { length: 50 }),
  area: varchar('area', { length: 50 }),
  cycle: varchar('cycle', { length: 50 }),
  is_active: integer('is_active').notNull().default(1),
  visit_day: varchar('visit_day', { length: 50 }),
  odd_even: varchar('odd_even', { length: 20 }),
  photos: jsonb('photos').default([]),
  remarks: text('remarks').default(''),
  range_health_facilities: integer('range_health_facilities').default(0),
  range_work_place: integer('range_work_place').default(0),
  range_public_transportation_facilities: integer(
    'range_public_transportation_facilities',
  ).default(0),
  range_worship_facilities: integer('range_worship_facilities').default(0),
  range_playground_facilities: integer('range_playground_facilities').default(
    0,
  ),
  range_educational_facilities: integer('range_educational_facilities').default(
    0,
  ),
  survey_outlet_id: integer('survey_outlet_id').references(() => Survey.id),
  old_outlet_id: integer('old_outlet_id'),
  created_by: varchar('created_by', { length: 100 }),
  created_at: timestamp('created_at').defaultNow(),
  updated_by: varchar('updated_by', { length: 100 }),
  updated_at: timestamp('updated_at').defaultNow(),
  deleted_by: varchar('deleted_by', { length: 100 }),
  deleted_at: timestamp('deleted_at').default(null),
});

export const outletRelations = relations(mOutlets, ({ many }) => ({
  activities: many(Activity),
}));
