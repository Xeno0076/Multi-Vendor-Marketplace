import { createHmac, randomBytes, scrypt as nodeScrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { and, eq, gt } from "drizzle-orm";
import {
  db,
  sellersTable,
  sessionsTable,
  usersTable,
  type User,
} from "@workspace/db";

const scrypt = promisify(nodeScrypt);
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;

export const SESSION_COOKIE = "marketly_session";

export type SellerProfile = {
  id: number;
  storeName: string;
  description: string;
};

export type AuthenticatedUser = {
  id: number;
  name: string;
  email: string;
  role: Exclude<User["role"], "admin">;
  seller?: SellerProfile;
};

export class DuplicateEmailError extends Error {
  constructor() {
    super("An account with that email already exists.");
    this.name = "DuplicateEmailError";
  }
}

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET must be configured for authentication.");
  }
  return secret;
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  return `scrypt$${salt}$${derivedKey.toString("hex")}`;
}

export async function verifyPassword(password: string, storedHash: string) {
  const [algorithm, salt, key] = storedHash.split("$");
  if (algorithm !== "scrypt" || !salt || !key) return false;

  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  const expectedKey = Buffer.from(key, "hex");
  return (
    derivedKey.length === expectedKey.length &&
    timingSafeEqual(derivedKey, expectedKey)
  );
}

function hashSessionToken(token: string) {
  return createHmac("sha256", getSessionSecret()).update(token).digest("hex");
}

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_TTL_MS,
    path: "/",
  };
}

export function getClearSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  };
}

function toAuthenticatedUser(row: {
  userId: number;
  name: string;
  email: string;
  role: User["role"];
  sellerId: number | null;
  storeName: string | null;
  sellerDescription: string | null;
}): AuthenticatedUser {
  if (row.role === "admin") {
    throw new Error("Admin accounts are not supported by the marketplace account UI.");
  }

  return {
    id: row.userId,
    name: row.name,
    email: row.email,
    role: row.role,
    ...(row.sellerId
      ? {
          seller: {
            id: row.sellerId,
            storeName: row.storeName ?? "",
            description: row.sellerDescription ?? "",
          },
        }
      : {}),
  };
}

export async function findAuthenticatedUserById(userId: number) {
  const [row] = await db
    .select({
      userId: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      role: usersTable.role,
      sellerId: sellersTable.id,
      storeName: sellersTable.storeName,
      sellerDescription: sellersTable.description,
    })
    .from(usersTable)
    .leftJoin(sellersTable, eq(sellersTable.userId, usersTable.id))
    .where(eq(usersTable.id, userId))
    .limit(1);

  return row ? toAuthenticatedUser(row) : null;
}

export async function findAuthenticatedUserBySessionToken(token: string) {
  const [row] = await db
    .select({
      userId: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      role: usersTable.role,
      sellerId: sellersTable.id,
      storeName: sellersTable.storeName,
      sellerDescription: sellersTable.description,
    })
    .from(sessionsTable)
    .innerJoin(usersTable, eq(sessionsTable.userId, usersTable.id))
    .leftJoin(sellersTable, eq(sellersTable.userId, usersTable.id))
    .where(
      and(
        eq(sessionsTable.tokenHash, hashSessionToken(token)),
        gt(sessionsTable.expiresAt, new Date()),
      ),
    )
    .limit(1);

  return row ? toAuthenticatedUser(row) : null;
}

export async function createSession(userId: number) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await db.insert(sessionsTable).values({
    userId,
    tokenHash: hashSessionToken(token),
    expiresAt,
  });

  return token;
}

export async function deleteSession(token: string) {
  await db
    .delete(sessionsTable)
    .where(eq(sessionsTable.tokenHash, hashSessionToken(token)));
}

export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
  role: "customer" | "seller";
}) {
  const passwordHash = await hashPassword(input.password);
  const email = normalizeEmail(input.email);

  let user: AuthenticatedUser;
  try {
    user = await db.transaction(async (tx) => {
      const [existing] = await tx
        .select({ id: usersTable.id })
        .from(usersTable)
        .where(eq(usersTable.email, email))
        .limit(1);

      if (existing) throw new DuplicateEmailError();

      const [createdUser] = await tx
        .insert(usersTable)
        .values({
          name: input.name.trim(),
          email,
          password: passwordHash,
          role: input.role,
        })
        .returning({
          id: usersTable.id,
          name: usersTable.name,
          email: usersTable.email,
          role: usersTable.role,
        });

      if (input.role === "seller") {
        await tx.insert(sellersTable).values({
          userId: createdUser.id,
          storeName: `${createdUser.name}'s Marketly shop`,
          description: "A new independent shop on Marketly.",
        });
      }

      const [seller] = await tx
        .select({
          id: sellersTable.id,
          storeName: sellersTable.storeName,
          description: sellersTable.description,
        })
        .from(sellersTable)
        .where(eq(sellersTable.userId, createdUser.id))
        .limit(1);

      return {
        ...createdUser,
        role: createdUser.role as Exclude<User["role"], "admin">,
        ...(seller ? { seller } : {}),
      };
    });
  } catch (error) {
    if (
      error instanceof DuplicateEmailError ||
      (typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "23505")
    ) {
      throw new DuplicateEmailError();
    }
    throw error;
  }

  const token = await createSession(user.id);
  return { user, token };
}

export async function authenticateUser(emailInput: string, password: string) {
  const email = normalizeEmail(emailInput);
  const [user] = await db
    .select({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      role: usersTable.role,
      password: usersTable.password,
    })
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);

  if (!user || !(await verifyPassword(password, user.password))) {
    return null;
  }

  const safeUser = await findAuthenticatedUserById(user.id);
  if (!safeUser) return null;

  const token = await createSession(user.id);
  return { user: safeUser, token };
}