import { relations } from "drizzle-orm";

import { cartItemsTable } from "./cart-items";
import { cartsTable } from "./carts";
import { categoriesTable } from "./categories";
import { orderItemsTable } from "./order-items";
import { ordersTable } from "./orders";
import { productsTable } from "./products";
import { sellersTable } from "./sellers";
import { usersTable } from "./users";

export const usersRelations = relations(usersTable, ({ one, many }) => ({
  seller: one(sellersTable),
  cart: one(cartsTable),
  orders: many(ordersTable),
}));

export const sellersRelations = relations(sellersTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [sellersTable.userId],
    references: [usersTable.id],
  }),
  products: many(productsTable),
  orderItems: many(orderItemsTable),
}));

export const categoriesRelations = relations(
  categoriesTable,
  ({ many }) => ({
    products: many(productsTable),
  }),
);

export const productsRelations = relations(productsTable, ({ one, many }) => ({
  seller: one(sellersTable, {
    fields: [productsTable.sellerId],
    references: [sellersTable.id],
  }),
  category: one(categoriesTable, {
    fields: [productsTable.categoryId],
    references: [categoriesTable.id],
  }),
  cartItems: many(cartItemsTable),
  orderItems: many(orderItemsTable),
}));

export const cartsRelations = relations(cartsTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [cartsTable.userId],
    references: [usersTable.id],
  }),
  items: many(cartItemsTable),
}));

export const cartItemsRelations = relations(
  cartItemsTable,
  ({ one }) => ({
    cart: one(cartsTable, {
      fields: [cartItemsTable.cartId],
      references: [cartsTable.id],
    }),
    product: one(productsTable, {
      fields: [cartItemsTable.productId],
      references: [productsTable.id],
    }),
  }),
);

export const ordersRelations = relations(ordersTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [ordersTable.userId],
    references: [usersTable.id],
  }),
  items: many(orderItemsTable),
}));

export const orderItemsRelations = relations(
  orderItemsTable,
  ({ one }) => ({
    order: one(ordersTable, {
      fields: [orderItemsTable.orderId],
      references: [ordersTable.id],
    }),
    product: one(productsTable, {
      fields: [orderItemsTable.productId],
      references: [productsTable.id],
    }),
    seller: one(sellersTable, {
      fields: [orderItemsTable.sellerId],
      references: [sellersTable.id],
    }),
  }),
);