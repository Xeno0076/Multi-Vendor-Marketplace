import { createInsertSchema } from "drizzle-zod";
import {
  check,
  integer,
  numeric,
  pgTable,
  serial,
  unique,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { z } from "zod/v4";

import { ordersTable } from "./orders";
import { productsTable } from "./products";
import { sellersTable } from "./sellers";

export const orderItemsTable = pgTable(
  "order_items",
  {
    id: serial("id").primaryKey(),
    orderId: integer("order_id")
      .notNull()
      .references(() => ordersTable.id, { onDelete: "cascade" }),
    productId: integer("product_id")
      .notNull()
      .references(() => productsTable.id, { onDelete: "restrict" }),
    sellerId: integer("seller_id")
      .notNull()
      .references(() => sellersTable.id, { onDelete: "restrict" }),
    quantity: integer("quantity").notNull().default(1),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  },
  (table) => ({
    orderProductSellerUnique: unique(
      "order_items_order_product_seller_unique",
    ).on(table.orderId, table.productId, table.sellerId),
    quantityPositive: check(
      "order_items_quantity_positive",
      sql`${table.quantity} > 0`,
    ),
    priceNonNegative: check(
      "order_items_price_non_negative",
      sql`${table.price} >= 0`,
    ),
  }),
);

export const insertOrderItemSchema = createInsertSchema(orderItemsTable).omit({
  id: true,
});

export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type OrderItem = typeof orderItemsTable.$inferSelect;