import { and, asc, eq, ilike } from "drizzle-orm";
import { Router, type IRouter } from "express";
import {
  GetProductParams,
  GetProductResponse,
  ListCategoriesResponse,
  ListProductsQueryParams,
  ListProductsResponse,
} from "@workspace/api-zod";
import {
  categoriesTable,
  db,
  productsTable,
  sellersTable,
} from "@workspace/db";

const router: IRouter = Router();

type MarketplaceProductRow = {
  id: number;
  sellerId: number;
  categoryId: number;
  name: string;
  description: string;
  price: string;
  image: string;
  stock: number;
  sellerName: string;
  categoryName: string;
};

function serializeProduct(product: MarketplaceProductRow) {
  return {
    id: product.id,
    sellerId: product.sellerId,
    categoryId: product.categoryId,
    name: product.name,
    description: product.description,
    price: Number(product.price),
    image: product.image,
    stock: product.stock,
    sellerName: product.sellerName,
    categoryName: product.categoryName,
  };
}

const productSelection = {
  id: productsTable.id,
  sellerId: productsTable.sellerId,
  categoryId: productsTable.categoryId,
  name: productsTable.name,
  description: productsTable.description,
  price: productsTable.price,
  image: productsTable.image,
  stock: productsTable.stock,
  sellerName: sellersTable.storeName,
  categoryName: categoriesTable.name,
};

router.get("/products", async (req, res): Promise<void> => {
  const parsedQuery = ListProductsQueryParams.safeParse(req.query);

  if (!parsedQuery.success) {
    res.status(400).json({ error: parsedQuery.error.message });
    return;
  }

  const search = parsedQuery.data.search?.trim();
  const categoryId = parsedQuery.data.categoryId;

  const products = await db
    .select(productSelection)
    .from(productsTable)
    .innerJoin(sellersTable, eq(productsTable.sellerId, sellersTable.id))
    .innerJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(
      and(
        search ? ilike(productsTable.name, `%${search}%`) : undefined,
        categoryId !== undefined
          ? eq(productsTable.categoryId, categoryId)
          : undefined,
      ),
    )
    .orderBy(asc(productsTable.createdAt));

  res.json(ListProductsResponse.parse(products.map(serializeProduct)));
});

router.get("/products/:id", async (req, res): Promise<void> => {
  const parsedParams = GetProductParams.safeParse(req.params);

  if (!parsedParams.success) {
    res.status(400).json({ error: parsedParams.error.message });
    return;
  }

  const [product] = await db
    .select(productSelection)
    .from(productsTable)
    .innerJoin(sellersTable, eq(productsTable.sellerId, sellersTable.id))
    .innerJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(eq(productsTable.id, parsedParams.data.id))
    .limit(1);

  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  res.json(GetProductResponse.parse(serializeProduct(product)));
});

router.get("/categories", async (_req, res): Promise<void> => {
  const categories = await db
    .select({
      id: categoriesTable.id,
      name: categoriesTable.name,
      description: categoriesTable.description,
    })
    .from(categoriesTable)
    .orderBy(asc(categoriesTable.name));

  res.json(ListCategoriesResponse.parse(categories));
});

export default router;