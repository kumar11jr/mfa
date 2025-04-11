import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  twoFactorSecret: text("two_factor_secret"),
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  faceEnabled: boolean("face_enabled").default(false),
  faceData: text("face_data"), // Base64 encoded face image
  tempSecret: text("temp_secret"), // For 2FA setup flow
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const setup2FASchema = z.object({
  token: z.string().min(6).max(6),
});

export const loginSchema = insertUserSchema.extend({
  token: z.string().optional(),
  faceImage: z.string().optional(),
});

export type LoginData = z.infer<typeof loginSchema>;
