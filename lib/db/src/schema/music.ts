import { boolean, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const musicTable = pgTable("rohead_music", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  coverImage: text("cover_image").notNull().default(""),
  embedLink: text("embed_link").notNull().default(""),
  genre: text("genre").notNull().default(""),
  artist: text("artist").notNull().default("Rohead"),
  producer: text("producer").notNull().default(""),
  featured: boolean("featured").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertMusicSchema = createInsertSchema(musicTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertMusic = z.infer<typeof insertMusicSchema>;
export type Music = typeof musicTable.$inferSelect;
