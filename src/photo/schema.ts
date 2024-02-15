import { getTableColumns } from "drizzle-orm";
import { pgTable, integer, serial, text, timestamp } from "drizzle-orm/pg-core";

// esbuild doesn't support standard decorators yet, so we cannot import from "../album"
import { albums } from "../album/schema";

export const photos = pgTable("photos", {
  id: serial("id").primaryKey().notNull(),
  path: text("path").unique().notNull(),
  description: text("description"),
  albumId: integer("albumId")
    .references(() => albums.id, {
      onDelete: "cascade",
    })
    .notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const PHOTO_COLUMNS = getTableColumns(photos);

export type Photo = typeof photos.$inferSelect;
