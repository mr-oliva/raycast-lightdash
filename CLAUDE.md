# Raycast Lightdash Extension

## Commands

```bash
bun run dev        # Raycast development mode
bun run build      # Build extension
bun run test       # Run tests (vitest)
bun run test:watch # Run tests in watch mode
bun run lint       # Lint (ESLint + Prettier via ray lint)
bun run lint:fix   # Auto-fix lint issues
```

## Architecture

```
src/
  search.tsx              # Search command (List UI with project dropdown)
  api/
    client.ts             # Lightdash API client (fetch-based)
    types.ts              # API response types and SearchResult
  hooks/
    use-lightdash.ts      # useLightdashSearch, useProjects hooks
  helpers/
    url.ts                # URL builders (dashboard, chart)
    transform.ts          # API response -> SearchResult transform
tests/
  __mocks__/
    raycast-api.ts        # @raycast/api mock (vitest alias)
  api/
    client.test.ts        # API client unit tests
  helpers/
    url.test.ts           # URL builder unit tests
    transform.test.ts     # Transform logic unit tests
  usecases/
    search-*.test.ts      # Use case tests
    project-switching.test.ts
```

## Raycast Extension Conventions

- Command files in `src/` map to `commands[].name` in `package.json`
- Preferences accessed via `getPreferenceValues<T>()` from `@raycast/api`
- UI uses `List`, `List.Section`, `List.Dropdown`, `Action`, `ActionPanel`
- Data fetching uses `useCachedPromise` from `@raycast/utils`

## Lightdash API

- Auth header: `Authorization: ApiKey <token>`
- Projects: `GET /api/v1/org/projects`
- Dashboards: `GET /api/v1/projects/{uuid}/dashboards`
- Charts: `GET /api/v1/projects/{uuid}/charts`
- Dashboard URL: `{baseUrl}/projects/{projectUuid}/dashboards/{uuid}`
- Chart URL: `{baseUrl}/projects/{projectUuid}/saved/{uuid}`

## Testing

- vitest with `@raycast/api` aliased to `tests/__mocks__/raycast-api.ts`
- `fetch` mocked via `vi.fn()` on `global.fetch`
- `vi.resetModules()` + dynamic import for per-test isolation in client tests
- Two test layers: unit tests (helpers, client) and use case tests (scenarios)

## Notes

- `package.json` `author` field requires a valid Raycast Store username for publishing
- `bun` is the package manager (not npm/yarn)
