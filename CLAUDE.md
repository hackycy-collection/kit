# CLAUDE.md

A TypeScript monorepo (`@hackycy-kit`) providing shared utilities, Vue 3 component enhancements (Ant Design Vue), and Node.js helpers. Uses pnpm workspaces + Turborepo.

## Commands

```bash
pnpm build          # Build all packages (via turbo, respects dependency order)
pnpm dev            # Dev mode for packages/* with watch
pnpm play           # Run Vue playground app (Vite dev server)
pnpm test           # Run tests (vitest with happy-dom)
pnpm lint           # Lint with eslint (antfu config)
pnpm typecheck      # TypeScript type checking
```

Run a single test file:
```bash
pnpm vitest run --dom path/to/file.test.ts
```

Run tests for a specific package:
```bash
pnpm vitest run --dom packages/shared
```

## Architecture

### Package Dependency Graph

```
shared          (foundation: no workspace deps)
  ├── tools      (extends shared + adds cache, axios, Vue hooks)
  ├── advanced-antdv  (Vue 3 + Ant Design Vue table/modal wrappers)
  └── (no relation)
node            (standalone Node.js utilities, no workspace deps)
```

### Packages

- **shared** — Foundation utility library: color, date (dayjs), DOM, download, tree traversal, string helpers, precision math (big.js), event emitter (mitt), and re-exports from `es-toolkit/compat`. All other browser-side packages depend on this.
- **core** — Re-exports shared, adds `StorageManager` (localStorage/sessionStorage with TTL), re-exports axios, and Vue composition hooks.
- **advanced-antdv** — `useTable()` hook for ant-design-vue Table with auto-pagination, API fetching, row selection. Peer-depends on `ant-design-vue@^4` and `vue@^3`. Has SCSS styles.
- **node** — Pure Node.js stdlib utilities: IP resolution, terminal screen clearing, hyperlinks.

### Build & Tooling

- **Bundler:** `tsdown` — each package has its own `tsdown.config.ts`. Outputs ESM (`.mjs`) + type declarations (`.d.mts`).
- **All packages** use `"type": "module"` and `"sideEffects": false`.
- **Workspace deps** use `workspace:*` protocol.
- **pnpm catalogs** pin shared dev/lib dependency versions in `pnpm-workspace.yaml` (catalogs: `cli`, `lib`, `play`, `testing`, `types`).
- **ESLint:** `@antfu/eslint-config` with `type: 'lib'`.
- **Pre-commit hook:** `simple-git-hooks` runs `lint-staged` (eslint --fix on all staged files).
- **Tests:** Vitest 4 with `happy-dom` environment. Tests live alongside source in `__tests__/` directories.

### Playground

`playground/` is a Vue 3 + Vite + Tailwind CSS v4 demo app for testing library features interactively. **Run `pnpm build` before `pnpm play`** — the playground consumes the packages' compiled `dist/` via workspace symlinks.

Structure: `src/router/index.ts` defines both routes and `navConfig` (the sidebar nav data). `src/layouts/DefaultLayout.vue` renders the sidebar + content shell. Demo pages live in `src/views/{category}/`. The app theme and ant-design-vue overrides are in `src/style.css`.
