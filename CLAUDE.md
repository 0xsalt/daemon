---
description: Use Bun instead of Node.js, npm, pnpm, or vite.
globs: "*.ts, *.tsx, *.html, *.css, *.js, *.jsx, package.json"
alwaysApply: false
---

## Project Standards

This project follows PAI standards (see `~/.claude/Arcana/Documentation/PROJECT-STANDARDS.md`):

- **Versioning:** [Semantic Versioning 2.0.0](https://semver.org/)
- **Changelog:** [Keep a Changelog 1.1.0](https://keepachangelog.com/) format
- **Commits:** No AI attribution, use conventional commit types (feat/fix/docs/refactor/test/chore)

When making changes:
1. Update `CHANGELOG.md` under `[Unreleased]` section
2. Use appropriate change categories: Added, Changed, Deprecated, Removed, Fixed, Security
3. Bump version in package.json when releasing

## Fork Information

- **Upstream:** [danielmiessler/Daemon](https://github.com/danielmiessler/Daemon)
- **Fork:** [0xsalt/daemon](https://github.com/0xsalt/daemon)
- **Baseline:** Upstream had no releases; we start at 1.0.0 (2026-01-09)

## Branching Strategy

| Branch | Purpose | Contains Personal Content? |
|--------|---------|---------------------------|
| `main` | Deployed personal site | YES |
| `upstream-main` | Clean branch tracking upstream | NO |

**Remotes:**
- `origin` = your fork (0xsalt/daemon) - push here
- `upstream` = original repo (danielmiessler/Daemon) - pull from here

**Workflow:**
- **Never commit directly to main** - always use branches, merge when ready
- `dev/*` branches for personal site improvements (branch from main)
- `feature/*`, `bug/*` branches for upstream PRs (branch from upstream-main)
- Sync upstream: `git fetch upstream && git checkout upstream-main && git merge upstream/main`

**Never PR from main** - it contains personal identity data.

---

Default to using Bun instead of Node.js.

- Use `bun <file>` instead of `node <file>` or `ts-node <file>`
- Use `bun test` instead of `jest` or `vitest`
- Use `bun build <file.html|file.ts|file.css>` instead of `webpack` or `esbuild`
- Use `bun install` instead of `npm install` or `yarn install` or `pnpm install`
- Use `bun run <script>` instead of `npm run <script>` or `yarn run <script>` or `pnpm run <script>`
- Bun automatically loads .env, so don't use dotenv.

## APIs

- `Bun.serve()` supports WebSockets, HTTPS, and routes. Don't use `express`.
- `bun:sqlite` for SQLite. Don't use `better-sqlite3`.
- `Bun.redis` for Redis. Don't use `ioredis`.
- `Bun.sql` for Postgres. Don't use `pg` or `postgres.js`.
- `WebSocket` is built-in. Don't use `ws`.
- Prefer `Bun.file` over `node:fs`'s readFile/writeFile
- Bun.$`ls` instead of execa.

## Testing

Use `bun test` to run tests.

```ts#index.test.ts
import { test, expect } from "bun:test";

test("hello world", () => {
  expect(1).toBe(1);
});
```

## Frontend

Use HTML imports with `Bun.serve()`. Don't use `vite`. HTML imports fully support React, CSS, Tailwind.

Server:

```ts#index.ts
import index from "./index.html"

Bun.serve({
  routes: {
    "/": index,
    "/api/users/:id": {
      GET: (req) => {
        return new Response(JSON.stringify({ id: req.params.id }));
      },
    },
  },
  // optional websocket support
  websocket: {
    open: (ws) => {
      ws.send("Hello, world!");
    },
    message: (ws, message) => {
      ws.send(message);
    },
    close: (ws) => {
      // handle close
    }
  },
  development: {
    hmr: true,
    console: true,
  }
})
```

HTML files can import .tsx, .jsx or .js files directly and Bun's bundler will transpile & bundle automatically. `<link>` tags can point to stylesheets and Bun's CSS bundler will bundle.

```html#index.html
<html>
  <body>
    <h1>Hello, world!</h1>
    <script type="module" src="./frontend.tsx"></script>
  </body>
</html>
```

With the following `frontend.tsx`:

```tsx#frontend.tsx
import React from "react";

// import .css files directly and it works
import './index.css';

import { createRoot } from "react-dom/client";

const root = createRoot(document.body);

export default function Frontend() {
  return <h1>Hello, world!</h1>;
}

root.render(<Frontend />);
```

Then, run index.ts

```sh
bun --hot ./index.ts
```

For more information, read the Bun API docs in `node_modules/bun-types/docs/**.md`.
