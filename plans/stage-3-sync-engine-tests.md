# Stage 3: Sync Engine Tests

## Intent

Add package-local regression tests for `sync-engine` using TypeScript compilation and Node's built-in test runner. The tests cover freshness decisions, force refresh, in-flight dedupe, state/cache writes, failure mapping, cleanup after adapter failures, and typed result preservation.

## Scope

- Add `packages/sync-engine/src/index.test.ts`.
- Add package-local test compilation through `packages/sync-engine/tsconfig.test.json`.
- Add a `sync-engine` package `test` script.
- Keep the package free of external test framework dependencies.

## Success Criteria

- `pnpm --filter sync-engine type-check` passes.
- `pnpm --filter sync-engine test` passes.
- Duplicate calls for the same store key invoke `sync` once.
- Adapter setup failures do not leave stale in-flight entries.

## Rollback

Remove the test file, test tsconfig, and package `test` script. Revert any implementation changes only if the adapter failure cleanup behavior is intentionally not required.
