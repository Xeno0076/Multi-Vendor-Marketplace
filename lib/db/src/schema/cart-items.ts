import { createInsertSchema } from "drizzle-zod";
import {
  check,
  integer,
  pgTable,
  serial,
  unique,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { z } from "zod/v4";

import { cartsTable } from "./carts";
import { productsTable } from "./products";

export const cartItemsTable = pgTable(
  "cart_items",
  {
    id: serial("id").primaryKey(),
    cartId: integer("cart_id")
      .notNull()
      .references(() => cartsTable.id, { onDelete: "cascade" }),
    productId: integer("product_id")
      .notNull()
      .references(() => productsTable.id, { onDelete: "restrict" }),
    quantity: integer("quantity").notNull().default(1),
  },
  (table) => ({
    cartProductUnique: unique("cart_items_cart_product_unique").on(
      table.cartId,
      table.productId,
    ),
    quantityPositive: check(
      "cart_items_quantity_positive",
      sql`${table.quantity} > 0`,
    ),
  }),
);

export const insertCartItemSchema = createInsertSchema(cartItemsTable).omit({
  id: true,
});

export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type CartItem = typeof cartItemsTable.$inferSelect;