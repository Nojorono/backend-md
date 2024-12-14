import { pgTable, serial, text, timestamp, boolean, integer, index } from 'drizzle-orm/pg-core';
import { MSioType } from './m_sio_type.schema';
import { relations } from 'drizzle-orm';

export const SioTypeGalery = pgTable('sio_type_galery', {
  id: serial('id').primaryKey(),
  sio_type_id: integer('sio_type_id').references(() => MSioType.id),
  name: text('name').notNull(),
  photo: text('photo'),
  created_at: timestamp('created_at').defaultNow(),
  type: integer('type').notNull(),
}, (table) => {
  return {
    nameIdx: index('name_idx').on(table.name)
  }
});

export const SioTypeGaleryRelations = relations(SioTypeGalery, ({ one }) => ({
  sioType: one(MSioType, {
    fields: [SioTypeGalery.sio_type_id],
    references: [MSioType.id]
  })
}));




