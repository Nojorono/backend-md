import {
  pgTable,
  serial,
  varchar,
  integer,
  timestamp,
  text,
  jsonb,
} from 'drizzle-orm/pg-core';
import { mOutlets } from './m_outlet.schema';

export const Survey = pgTable('survey', {
  id: serial('id').primaryKey(),
  batch_code: varchar('batch_code', { length: 150 }),
  outlet_code: varchar('outlet_code', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  brand: varchar('brand', { length: 255 }).notNull(),
  address_line: varchar('address_line', { length: 300 }),
  sub_district: varchar('sub_district', { length: 255 }),
  district: varchar('district', { length: 255 }),
  city_or_regency: varchar('city_or_regency', { length: 255 }),
  postal_code: integer('postal_code').default(0),
  latitude: varchar('latitude', { length: 225 }),
  longitude: varchar('longitude', { length: 225 }),
  sio_type: varchar('sio_type', { length: 150 }),
  region: varchar('region', { length: 150 }),
  area: varchar('area', { length: 150 }),
  cycle: varchar('cycle', { length: 150 }),
  visit_day: varchar('visit_day', { length: 150 }),
  odd_even: varchar('odd_even', { length: 50 }),
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
  outlet_id: integer('outlet_id').references(() => mOutlets.id),
  status: integer('status'),
  is_approved: integer('is_approved').default(null),
  created_by: varchar('created_by', { length: 100 }),
  created_at: timestamp('created_at').defaultNow(),
  updated_by: varchar('updated_by', { length: 100 }),
  updated_at: timestamp('updated_at').defaultNow(),
  deleted_by: varchar('deleted_by', { length: 100 }),
  deleted_at: timestamp('deleted_at').default(null),
});