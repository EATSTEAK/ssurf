# Stage 1: pnpm Workspace

## Intent

Prepare the repository for local packages while keeping the Expo app at the repository root. This stage only establishes pnpm workspace discovery and does not move app files or change sync behavior.

## Scope

- Add workspace package patterns for the root app package and future packages under `packages/*`.
- Keep Expo, Metro, Babel, and TypeScript entry paths unchanged.
- Leave all sync-related source files untouched.

## Success Criteria

- pnpm can discover the root app as a workspace package.
- Future packages under `packages/*` can be discovered without changing the root app layout.
- `pnpm type-check` passes.
- `pnpm lint` passes.

## Rollback

Remove the `packages` section from `pnpm-workspace.yaml` and delete this note.
