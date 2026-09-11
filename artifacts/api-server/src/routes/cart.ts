import { and, asc, eq } from "drizzle-orm";
import { Router, type IRouter } from "express";
import {
  AddCartItemBody,
  AddCartItemResponse,
  GetCartResponse,
  RemoveCartItemParams,
  RemoveCartItemResponse,
  UpdateCartItemBody,
  UpdateCartItemParams,
  UpdateCartItemResponse,
} from "@workspace/api-zod";
import {
  cartItemsTable,
  cartsTable,
  db,
  productsTable,
  sellersTable,
} from "@workspace/db";

const router: IRouter = Router();

export class CartStockError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CartStockError";
  }
}

function moneyFromCents(cents: number) {
  return Number((cents / 100).toFixed(2));
}

function priceToCents(price: string | number) {
  return Math.round(Number(price) * 100);
}

async function getOrCreateCart(userId: number) {
  let [cart] = await db
    .select({ id: cartsTable.id })
    .from(cartsTable)
    .where(eq(cartsTable.userId, userId))
    .limit(1);

  if (!cart) {
    await db
      .insert(cartsTable)
      .values({ userId })
      .onConflictDoNothing({ target: cartsTable.userId });
    [cart] = await db
      .select({ id: cartsTable.id })
      .from(cartsTable)
      .where(eq(cartsTable.userId, userId))
      .limit(1);
  }

  if (!cart) throw new Error("Unable to create cart.");
  return cart;
}

export async function getCartSnapshot(userId: number) {
  const cart = await getOrCreateCart(userId);
  const rows = await db
    .select({
      id: cartItemsTable.id,
      productId: productsTable.id,
      productName: productsTable.name,
      productImage: productsTable.image,
      sellerName: sellersTable.storeName,
      unitPrice: productsTable.price,
      quantity: cartItemsTable.quantity,
      stock: productsTable.stock,
    })
    .from(cartItemsTable)
    .innerJoin(productsTable, eq(cartItemsTable.productId, productsTable.id))
    .innerJoin(sellersTable, eq(productsTable.sellerId, sellersTable.id))
    .where(eq(cartItemsTable.cartId, cart.id))
    .orderBy(asc(cartItemsTable.id));

  const items = rows.map((row) => {
    const unitPrice = Number(row.unitPrice);
    const subtotal = moneyFromCents(priceToCents(unitPrice) * row.quantity);
    return {
      id: row.id,
      productId: row.productId,
      productName: row.productName,
      productImage: row.productImage,
      sellerName: row.sellerName,
      unitPrice,
      quantity: row.quantity,
      subtotal,
      stock: row.stock,
    };
  });

  return {
    id: cart.id,
    items,
    itemCount: items.reduce((total, item) => total + item.quantity, 0),
    total: moneyFromCents(
      items.reduce((total, item) => total + priceToCents(item.unitPrice) * item.quantity, 0),
    ),
  };
}

function requireUser(req: { user?: { id: number } }, res: any) {
  if (!req.user) {
    res.status(401).json({ error: "Authentication required." });
    return null;
  }
  return req.user;
}

router.get("/cart", async (req, res): Promise<void> => {
  const user = requireUser(req, res);
  if (!user) return;
  res.json(GetCartResponse.parse(await getCartSnapshot(user.id)));
});

router.post("/cart/items", async (req, res): Promise<void> => {
  const user = requireUser(req, res);
  if (!user) return;

  const parsed = AddCartItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    await db.transaction(async (tx) => {
      let [cart] = await tx
        .select({ id: cartsTable.id })
        .from(cartsTable)
        .where(eq(cartsTable.userId, user.id))
        .limit(1);
      if (!cart) {
        await tx
          .insert(cartsTable)
          .values({ userId: user.id })
          .onConflictDoNothing({ target: cartsTable.userId });
        [cart] = await tx
          .select({ id: cartsTable.id })
          .from(cartsTable)
          .where(eq(cartsTable.userId, user.id))
          .limit(1);
      }
      if (!cart) throw new Error("Unable to create cart.");

      const [product] = await tx
        .select({ id: productsTable.id, stock: productsTable.stock })
        .from(productsTable)
        .where(eq(productsTable.id, parsed.data.productId))
        .limit(1);
      if (!product) {
        res.status(404).json({ error: "Product not found." });
        throw new CartStockError("Product not found.");
      }

      const [existing] = await tx
        .select({ id: cartItemsTable.id, quantity: cartItemsTable.quantity })
        .from(cartItemsTable)
        .where(
          and(
            eq(cartItemsTable.cartId, cart.id),
            eq(cartItemsTable.productId, parsed.data.productId),
          ),
        )
        .limit(1);

      const nextQuantity = (existing?.quantity ?? 0) + parsed.data.quantity;
      if (product.stock < nextQuantity) {
        throw new CartStockError(
          `Only ${product.stock} of this product are available.`,
        );
      }

      if (existing) {
        await tx
          .update(cartItemsTable)
          .set({ quantity: nextQuantity })
          .where(eq(cartItemsTable.id, existing.id));
      } else {
        await tx.insert(cartItemsTable).values({
          cartId: cart.id,
          productId: parsed.data.productId,
          quantity: parsed.data.quantity,
        });
      }
    });
  } catch (error) {
    if (error instanceof CartStockError) {
      console.log("CART ERROR:", error.message);
      if (!res.headersSent) {
        res.status(error.message === "Product not found." ? 404 : 409).json({
          error: error.message,
        });
      }
      return;
    }
    throw error;
  }

  res.json(AddCartItemResponse.parse(await getCartSnapshot(user.id)));
});

router.patch("/cart/items/:id", async (req, res): Promise<void> => {
  const user = requireUser(req, res);
  if (!user) return;

  const parsedParams = UpdateCartItemParams.safeParse(req.params);
  const parsedBody = UpdateCartItemBody.safeParse(req.body);
  if (!parsedParams.success || !parsedBody.success) {
    res.status(400).json({
      error: parsedParams.success
        ? parsedBody.error.message
        : parsedParams.error.message,
    });
    return;
  }

  try {
    await db.transaction(async (tx) => {
      const [item] = await tx
        .select({
          id: cartItemsTable.id,
          quantity: cartItemsTable.quantity,
          stock: productsTable.stock,
        })
        .from(cartItemsTable)
        .innerJoin(cartsTable, eq(cartItemsTable.cartId, cartsTable.id))
        .innerJoin(productsTable, eq(cartItemsTable.productId, productsTable.id))
        .where(
          and(
            eq(cartItemsTable.id, parsedParams.data.id),
            eq(cartsTable.userId, user.id),
          ),
        )
        .limit(1);

      if (!item) throw new CartStockError("Cart item not found.");
      if (parsedBody.data.quantity > item.stock) {
        throw new CartStockError(
          `Only ${item.stock} of this product are available.`,
        );
      }

      await tx
        .update(cartItemsTable)
        .set({ quantity: parsedBody.data.quantity })
        .where(eq(cartItemsTable.id, item.id));
    });
  } catch (error) {
    if (error instanceof CartStockError) {
      res.status(error.message === "Cart item not found." ? 404 : 409).json({
        error: error.message,
      });
      return;
    }
    throw error;
  }

  res.json(UpdateCartItemResponse.parse(await getCartSnapshot(user.id)));
});

router.delete("/cart/items/:id", async (req, res): Promise<void> => {
  const user = requireUser(req, res);
  if (!user) return;

  const parsedParams = RemoveCartItemParams.safeParse(req.params);
  if (!parsedParams.success) {
    res.status(400).json({ error: parsedParams.error.message });
    return;
  }

  const deleted = await db
    .delete(cartItemsTable)
    .where(
      and(
        eq(cartItemsTable.id, parsedParams.data.id),
        eq(
          cartItemsTable.cartId,
          db
            .select({ id: cartsTable.id })
            .from(cartsTable)
            .where(eq(cartsTable.userId, user.id)),
        ),
      ),
    )
    .returning({ id: cartItemsTable.id });

  if (!deleted.length) {
    res.status(404).json({ error: "Cart item not found." });
    return;
  }

  res.json(RemoveCartItemResponse.parse(await getCartSnapshot(user.id)));
});

router.delete("/cart", async (req, res): Promise<void> => {
  const user = requireUser(req, res);
  if (!user) return;

  const cart = await getOrCreateCart(user.id);
  await db.delete(cartItemsTable).where(eq(cartItemsTable.cartId, cart.id));
  res.json(GetCartResponse.parse(await getCartSnapshot(user.id)));
});

export default router;