import { and, asc, desc, eq, sql } from "drizzle-orm";
import { Router, type IRouter } from "express";
import {
  CreateOrderBody,
  CreateOrderResponse,
  GetOrderParams,
  GetOrderResponse,
  ListOrdersResponse,
} from "@workspace/api-zod";
import {
  cartItemsTable,
  cartsTable,
  db,
  orderItemsTable,
  ordersTable,
  productsTable,
  sellersTable,
} from "@workspace/db";
import { CartStockError } from "./cart";

const router: IRouter = Router();

function moneyFromCents(cents: number) {
  return Number((cents / 100).toFixed(2));
}

function priceToCents(price: string | number) {
  return Math.round(Number(price) * 100);
}

async function getOrderSnapshot(userId: number, orderId: number) {
  const [order] = await db
    .select({
      id: ordersTable.id,
      totalAmount: ordersTable.totalAmount,
      status: ordersTable.status,
      createdAt: ordersTable.createdAt,
    })
    .from(ordersTable)
    .where(and(eq(ordersTable.id, orderId), eq(ordersTable.userId, userId)))
    .limit(1);

  if (!order) return null;

  const items = await db
    .select({
      id: orderItemsTable.id,
      productId: orderItemsTable.productId,
      productName: productsTable.name,
      sellerId: orderItemsTable.sellerId,
      sellerName: sellersTable.storeName,
      price: orderItemsTable.price,
      quantity: orderItemsTable.quantity,
    })
    .from(orderItemsTable)
    .innerJoin(productsTable, eq(orderItemsTable.productId, productsTable.id))
    .innerJoin(sellersTable, eq(orderItemsTable.sellerId, sellersTable.id))
    .where(eq(orderItemsTable.orderId, orderId))
    .orderBy(asc(orderItemsTable.id));

  return {
    id: order.id,
    totalAmount: Number(order.totalAmount),
    status: order.status,
    createdAt: order.createdAt.toISOString(),
    items: items.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.productName,
      sellerId: item.sellerId,
      sellerName: item.sellerName,
      price: Number(item.price),
      quantity: item.quantity,
      subtotal: moneyFromCents(priceToCents(item.price) * item.quantity),
    })),
  };
}

function requireUser(req: { user?: { id: number } }, res: any) {
  if (!req.user) {
    res.status(401).json({ error: "Authentication required." });
    return null;
  }
  return req.user;
}

router.post("/orders", async (req, res): Promise<void> => {
  const user = requireUser(req, res);
  if (!user) return;

  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const orderId = await db.transaction(async (tx) => {
      const [cart] = await tx
        .select({ id: cartsTable.id })
        .from(cartsTable)
        .where(eq(cartsTable.userId, user.id))
        .limit(1);
      if (!cart) throw new Error("Your cart is empty.");

      const cartItems = await tx
        .select({
          productId: cartItemsTable.productId,
          quantity: cartItemsTable.quantity,
        })
        .from(cartItemsTable)
        .where(eq(cartItemsTable.cartId, cart.id))
        .orderBy(asc(cartItemsTable.id));
      if (!cartItems.length) throw new Error("Your cart is empty.");

      const lockedProducts = [];
      let totalCents = 0;

      for (const item of cartItems) {
        const [product] = await tx
          .select({
            id: productsTable.id,
            name: productsTable.name,
            sellerId: productsTable.sellerId,
            price: productsTable.price,
            stock: productsTable.stock,
          })
          .from(productsTable)
          .where(eq(productsTable.id, item.productId))
          .for("update");

        if (!product) {
          throw new CartStockError("A product in your cart is no longer available.");
        }
        if (item.quantity > product.stock) {
          throw new CartStockError(
            `${product.name} only has ${product.stock} available.`,
          );
        }

        totalCents += priceToCents(product.price) * item.quantity;
        lockedProducts.push({ item, product });
      }

      const [order] = await tx
        .insert(ordersTable)
        .values({
          userId: user.id,
          totalAmount: (totalCents / 100).toFixed(2),
          status: "pending",
        })
        .returning({ id: ordersTable.id });

      await tx.insert(orderItemsTable).values(
        lockedProducts.map(({ item, product }) => ({
          orderId: order.id,
          productId: product.id,
          sellerId: product.sellerId,
          quantity: item.quantity,
          price: product.price,
        })),
      );

      for (const { item, product } of lockedProducts) {
        await tx
          .update(productsTable)
          .set({
            stock: sql`${productsTable.stock} - ${item.quantity}`,
            updatedAt: new Date(),
          })
          .where(eq(productsTable.id, product.id));
      }

      await tx.delete(cartItemsTable).where(eq(cartItemsTable.cartId, cart.id));
      return order.id;
    });

    const order = await getOrderSnapshot(user.id, orderId);
    res.status(201).json(CreateOrderResponse.parse(order));
  } catch (error) {
    if (error instanceof CartStockError) {
      res.status(409).json({ error: error.message });
      return;
    }
    if (error instanceof Error && error.message === "Your cart is empty.") {
      res.status(400).json({ error: error.message });
      return;
    }
    throw error;
  }
});

router.get("/orders", async (req, res): Promise<void> => {
  const user = requireUser(req, res);
  if (!user) return;

  const orders = await db
    .select({ id: ordersTable.id })
    .from(ordersTable)
    .where(eq(ordersTable.userId, user.id))
    .orderBy(desc(ordersTable.createdAt));
  const snapshots = await Promise.all(
    orders.map((order) => getOrderSnapshot(user.id, order.id)),
  );

  res.json(ListOrdersResponse.parse(snapshots.filter(Boolean)));
});

router.get("/orders/:id", async (req, res): Promise<void> => {
  const user = requireUser(req, res);
  if (!user) return;

  const parsed = GetOrderParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const order = await getOrderSnapshot(user.id, parsed.data.id);
  if (!order) {
    res.status(404).json({ error: "Order not found." });
    return;
  }

  res.json(GetOrderResponse.parse(order));
});

export default router;