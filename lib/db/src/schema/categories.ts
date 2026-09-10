import { createInsertSchema } from "drizzle-zod";
import {
  pgTable,
  serial,
  text,
  unique,
} from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const categoriesTable = pgTable(
  "categories",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description").notNull().default(""),
  },
  (table) => ({
    nameUnique: unique("categories_name_unique").on(table.name),
  }),
);

export const insertCategorySchema = createInsertSchema(categoriesTable).omit({
  id: true,
});

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categoriesTable.$inferSelect;