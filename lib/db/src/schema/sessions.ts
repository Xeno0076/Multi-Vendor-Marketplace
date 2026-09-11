import { pgTable, serial, integer, text, timestamp, unique } from "drizzle-orm/pg-core";

import { usersTable } from "./users";

export const sessionsTable = pgTable(
  "sessions",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    tokenHashUnique: unique("sessions_token_hash_unique").on(table.tokenHash),
  }),
);

export type Session = typeof sessionsTable.$inferSelect;