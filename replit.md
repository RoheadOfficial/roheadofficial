# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## ROHEAD OFFICIAL

- Premium creator streaming web app in `artifacts/rohead-official` with public Home, Music, Videos, and Admin routes.
- API routes live in `artifacts/api-server/src/routes/rohead.ts`; auth helpers live in `artifacts/api-server/src/lib/auth.ts`.
- API contract is maintained in `lib/api-spec/openapi.yaml`; generated React Query hooks live in `lib/api-client-react/src/generated/api.ts`.
- Database schema includes `rohead_users`, `rohead_music`, `rohead_videos`, `rohead_settings`, and `rohead_activity` in `lib/db/src/schema/index.ts`.
- Authentication uses JWT plus bcryptjs. JWT signing depends on the `SESSION_SECRET` environment secret.
- The first admin account is created through `/admin` when no admin exists. Admin roles include admin, moderator, and user, with granular `canManageMusic`, `canManageVideos`, `canManageUsers`, `canManageSettings`, and `canViewAnalytics` permission toggles.
- Public media is embed-first for Spotify, Apple Music, SoundCloud, and YouTube links. Seed media uses inline generated artwork to avoid external image loading failures in preview.
- Theme settings support Light, Dark, Ocean, Purple, Pink, and Red through CSS variables and document-level theme attributes.

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
