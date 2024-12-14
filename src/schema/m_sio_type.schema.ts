import {
  pgTable,
  serial,
  varchar,
  timestamp,
  jsonb,
} from 'drizzle-orm/pg-core';
import { SioTypeGalery } from './sio_type_galery.schema';
import { relations } from 'drizzle-orm';

export const MSioType = pgTable('m_sio_type', {
  id: serial('id').primaryKey().notNull(),
  name: varchar('name', { length: 80 }).unique().notNull(),
  component: jsonb('component').default([]),
  created_by: varchar('created_by', { length: 100 }),
  created_at: timestamp('created_at').defaultNow(),
  updated_by: varchar('updated_by', { length: 100 }),
  updated_at: timestamp('updated_at').defaultNow(),
  deleted_by: varchar('deleted_by', { length: 100 }),
  deleted_at: timestamp('deleted_at').default(null),
});

export const MSioTypeRelations = relations(MSioType, ({ many }) => ({
  sioTypeGalery: many(SioTypeGalery)
}));
