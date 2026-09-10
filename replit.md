# Marketly Marketplace

Marketly is the responsive foundation for a multi-vendor marketplace where shoppers discover independent sellers and their products.

## Run & Operate

- `pnpm --filter @workspace/marketplace run dev` — run the responsive web app
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only, when models are added)
- Required env for the API server: `DATABASE_URL`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/marketplace/` — React + Vite web application and landing page
- `artifacts/api-server/` — shared Express API service mounted at `/api`
- `lib/api-spec/openapi.yaml` — source of truth for API contracts
- `lib/api-client-react/` — generated React Query client hooks
- `lib/api-zod/` — generated server-side validation schemas
- `lib/db/` — Drizzle/PostgreSQL package reserved for future marketplace models

## Architecture decisions

- The web app is a separate root artifact so the marketplace can be previewed and published independently from the shared API service.
- API contracts stay OpenAPI-first so future catalog, seller, and order features can generate consistent client and server types.
- Database models are intentionally not created in the foundation phase; the current app only needs the existing health endpoint.

## Product

The first release introduces Marketly's brand and landing-page experience. Authentication, catalog management, seller tools, administration, checkout, and persistence are intentionally deferred.

## User preferences

- Keep the technology stack beginner-friendly and the code easy to extend.
- Support mobile, tablet, and desktop layouts from the start.

## Gotchas

- Run API code generation after changing `lib/api-spec/openapi.yaml`.
- Artifact workflows provide `PORT` and `BASE_PATH`; use the managed workflow instead of starting Vite directly.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
