import { serial, pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";
import { users } from "../user/schema";

export const albums = pgTable("albums", {
  id: serial("id").primaryKey().notNull(),
  title: text("title").notNull(),
  userId: integer("userId")
    .references(() => users.id, {
      onDelete: "cascade",
    })
    .notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Album = typeof albums.$inferSelect;
