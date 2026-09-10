import { createInsertSchema } from "drizzle-zod";
import { integer, pgTable, serial, unique } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

import { usersTable } from "./users";

export const cartsTable = pgTable(
  "carts",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
  },
  (table) => ({
    userUnique: unique("carts_user_id_unique").on(table.userId),
  }),
);

export const insertCartSchema = createInsertSchema(cartsTable).omit({
  id: true,
});

export type InsertCart = z.infer<typeof insertCartSchema>;
export type Cart = typeof cartsTable.$inferSelect;