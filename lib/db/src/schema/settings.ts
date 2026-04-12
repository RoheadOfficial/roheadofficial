import { boolean, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const settingsTable = pgTable("rohead_settings", {
  id: integer("id").primaryKey().default(1),
  siteName: text("site_name").notNull().default("ROHEAD OFFICIAL"),
  description: text("description").notNull().default("A premium creator platform for music, videos, and exclusive releases."),
  bannerUrl: text("banner_url").notNull().default(""),
  profileImageUrl: text("profile_image_url").notNull().default(""),
  aboutText: text("about_text").notNull().default("ROHEAD OFFICIAL is a cinematic home for music, visuals, and creative drops."),
  footerText: text("footer_text").notNull().default("ROHEAD OFFICIAL. All rights reserved."),
  defaultTheme: text("default_theme").notNull().default("dark"),
  publicSignupEnabled: boolean("public_signup_enabled").notNull().default(false),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertSettingsSchema = createInsertSchema(settingsTable).omit({
  updatedAt: true,
});

export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type SiteSettings = typeof settingsTable.$inferSelect;
