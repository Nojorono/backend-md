import {
  pgTable,
  serial,
  varchar,
  integer,
  timestamp,
  text,
  json,
} from 'drizzle-orm/pg-core';

export const mOutlets = pgTable('m_outlet', {
  id: serial('id').primaryKey(),
  outlet_code: varchar('outlet_code', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  brand: varchar('brand', { length: 255 }).notNull(),
  unique_name: varchar('unique_name', { length: 255 }).notNull(), // Added 'uniqueName'
  address_line: varchar('address_line', { length: 300 }).notNull(),
  sub_district: varchar('sub_district', { length: 255 }).default(''), // "kelurahan"
  district: varchar('district', { length: 255 }).notNull(), // "kecamatan"
  city_or_regency: varchar('city_or_regency', { length: 255 }).default(''), // "kota_or_kab"
  postal_code: integer('postal_code').default(1),
  latitude: varchar('latitude', { length: 225 }).default(''),
  longitude: varchar('longitude', { length: 225 }).default(''), // Corrected typo in "longitude"
  outlet_type: varchar('outlet_type', { length: 50 }).default(''),
  region: varchar('region', { length: 50 }).default(''),
  area: varchar('area', { length: 50 }).default(''),
  cycle: varchar('cycle', { length: 50 }).default(''),
  is_active: integer('is_active').notNull().default(1),
  visit_day: varchar('visit_day', { length: 50 }).notNull(), // Added 'visitDay' (Hari Kunjungan)
  odd_even: varchar('odd_even', { length: 20 }).notNull(), // Added 'oddEven' (Genap/Ganjil)
  photos: json('photos').default('[]'), // Changed 'photo' to 'photos' and made it a JSON array
  remarks: text('remarks').default(''), // Added 'remarks'
  created_by: varchar('created_by', { length: 20 }),
  created_at: timestamp('created_at').defaultNow(),
  updated_by: varchar('updated_by', { length: 20 }),
  updated_at: timestamp('updated_at').defaultNow(),
  deleted_by: varchar('deleted_by', { length: 20 }),
  deleted_at: timestamp('deleted_at').default(null),
});
