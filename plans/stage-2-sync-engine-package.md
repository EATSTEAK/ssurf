# Stage 2: Sync Engine Package

## Intent

Extract source-based revalidation into a domain-independent package. Domain code should define what to sync and how to rewrite its own storage, while the shared engine owns freshness checks, force refresh, in-flight dedupe, typed results, and state updates through an adapter.

## Scope

- Add `packages/sync-engine` as a local workspace package.
- Keep the package independent from React, Expo, Drizzle, Zustand, Rusaint, and app aliases.
- Add root workspace wiring so the app can depend on the package without migrating existing domain sync yet.
- Do not replace existing `src/shared/lib/sync.ts` or any entity sync hooks in this stage.

## Success Criteria

- `sync-engine` exposes typed source builders and `revalidateSource`.
- The package compiles independently.
- The root app can resolve the workspace package dependency.
- Existing app behavior remains unchanged.

## Rollback

Remove `packages/sync-engine`, remove the workspace dependency and path alias from root config, and delete this note.
