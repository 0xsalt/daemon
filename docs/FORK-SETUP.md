# Fork Setup Guide

Fork Daemon and deploy your personal API.

---

## Prerequisites

- [Bun](https://bun.sh) runtime
- [Cloudflare account](https://dash.cloudflare.com) (free tier works)
- Git

```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash

# Install wrangler globally
bun add -g wrangler
```

---

## Pre-Installation: System Analysis

Before modifying files, analyze your fork's current state.

### Detect Existing Configuration

```bash
# Check for files you'll modify
cd ~/path/to/daemon

echo "=== Files requiring personalization ==="

# Core identity file
if [ -f "public/daemon.md" ]; then
  echo "public/daemon.md: $(head -20 public/daemon.md | grep -c 'danielmiessler\|Daniel' || echo 0) upstream references"
fi

# Dashboard component
if [ -f "src/components/DaemonDashboard.tsx" ]; then
  DASHBOARD_ID=$(grep -o 'DAEMON://[^"]*' src/components/DaemonDashboard.tsx 2>/dev/null || echo "NOT FOUND")
  echo "DaemonDashboard.tsx identifier: $DASHBOARD_ID"
fi

# Wrangler project name
if [ -f "wrangler.toml" ]; then
  PROJECT_NAME=$(grep '^name' wrangler.toml | cut -d'"' -f2)
  echo "wrangler.toml project: $PROJECT_NAME"
fi

# Check for .env (should not exist in fresh fork)
if [ -f ".env" ]; then
  echo ".env: EXISTS (has CLOUDFLARE_API_TOKEN?)"
else
  echo ".env: NOT FOUND (create during setup)"
fi

echo ""
echo "=== Upstream references to clean ==="
grep -r "danielmiessler" --include="*.md" --include="*.ts" --include="*.tsx" -l 2>/dev/null | head -10
```

### Conflict Resolution Matrix

| Scenario | Detection | Action |
|----------|-----------|--------|
| Fresh fork | `daemon.md` has Daniel's content | Replace all identity sections |
| Partial setup | Some files personalized, others not | Use detection script, fix remaining |
| `.env` exists | Token already configured | Verify token works, skip token setup |
| wrangler.toml unchanged | Project name is `context-you-keep` | Change to your project name |

---

## 1. Fork & Clone

```bash
# Fork via GitHub UI, then clone
git clone git@github.com:YOUR_USERNAME/daemon.git
cd daemon
bun install
```

---

## 2. Personalize Your Daemon

### Required Changes

| File | Location | Change |
|------|----------|--------|
| `public/daemon.md` | All sections | Replace Daniel's identity with yours |
| `wrangler.toml` | Line 1 | `name = "context-you-keep"` → `name = "your-project"` |
| `src/components/DaemonDashboard.tsx` | Line 136 | `DAEMON://CONTEXT-YOU-KEEP` → `DAEMON://YOUR-ID` |
| `src/components/DaemonDashboard.tsx` | `fetchDaemonData()` function (~line 170) | Replace hardcoded `daemonData` object with your content |

### Cleanup Checklist

| File | Upstream Reference | Your Replacement |
|------|-------------------|------------------|
| `README.md` | `danielmiessler.com` | Your domain or remove |
| `README.md` | `daemon.danielmiessler.com` | `your-project.pages.dev` |
| `PLAN.md` | Daniel-specific roadmap | Remove file or rewrite |
| `src/components/Hero.tsx` | Hardcoded tagline/location | Your tagline/location |
| `.githooks/pre-push` | Checks for `danielmiessler/Daemon` | Your repo or remove check |
| `.githooks/pre-commit` | Email domain filter | Your email domain |
| `cms/.vitepress/config.mts` | Title references upstream | Your site title |
| `cms/.vitepress/theme/components/*.vue` | `mcp.daemon.danielmiessler.com` | Your MCP endpoint or remove |

**Architecture note:** The dashboard uses hardcoded data, not dynamic fetch from `daemon.md`. Keep both in sync until the build-time parser ships (see `docs/ROADMAP.md`).

---

## 3. Local Development

```bash
# Start dev server (http://localhost:4321)
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview
```

---

## 4. Cloudflare Setup

### Create API Token

1. Open https://dash.cloudflare.com/profile/api-tokens
2. Click **Create Token**
3. Select template: **Edit Cloudflare Workers**
4. Copy the token

### Configure Token

Create `.env` in project root:

```bash
echo "CLOUDFLARE_API_TOKEN=your-token-here" > .env
```

The `.env` file is gitignored—your token stays local.

---

## 5. Deploy

### First Deploy

```bash
bun run build && wrangler pages deploy dist
```

Wrangler creates a Cloudflare Pages project matching `wrangler.toml`'s `name` field.

**Production URL:** `https://YOUR-PROJECT-NAME.pages.dev`

### Subsequent Deploys

After initial setup:

```bash
bun run build && wrangler pages deploy dist
```

Or use an alias (add to `~/.bashrc` or `~/.zshrc`):

```bash
alias daemon-deploy='cd ~/path/to/daemon && bun run build && wrangler pages deploy dist'
```

---

## 6. MCP Server (JSON-RPC API)

The static site serves human visitors. The **MCP server** serves AI agents via JSON-RPC.

**Architecture:**
```
your-project.pages.dev     → Static website (Cloudflare Pages)
daemon-mcp.workers.dev     → MCP JSON-RPC API (Cloudflare Worker)
```

### Create MCP Worker Project

```bash
# Create sibling directory for MCP server
cd ~/path/to/projects  # parent of daemon/
mkdir daemon-mcp && cd daemon-mcp

# Scaffold using Cloudflare MCP template
bunx create-cloudflare@latest . \
  --template=cloudflare/ai/demos/remote-mcp-authless --no-git

# Install dependencies
bun install
```

### Customize for Your Daemon

Replace `src/index.ts` with Daemon-specific implementation that:
1. Fetches your `daemon.md` from the static site
2. Parses sections by `[SECTION_NAME]` headers
3. Exposes tools: `get_about`, `get_telos`, `get_mission`, etc.

See reference implementation: `https://github.com/0xsalt/daemon-mcp`

**Key configuration in `wrangler.jsonc`:**
```json
{
  "name": "daemon-mcp",
  "main": "src/index.ts",
  "compatibility_flags": ["nodejs_compat"],
  "durable_objects": {
    "bindings": [{ "class_name": "DaemonMCP", "name": "MCP_OBJECT" }]
  }
}
```

### Deploy MCP Server

```bash
# Copy your Cloudflare token
cp ~/path/to/daemon/.env .

# Deploy
npx wrangler deploy
```

**MCP URL:** `https://daemon-mcp.YOUR-ACCOUNT.workers.dev`

### Test MCP Endpoint

```bash
# List available tools
curl -X POST https://daemon-mcp.YOUR-ACCOUNT.workers.dev/ \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":1}'

# Call a tool
curl -X POST https://daemon-mcp.YOUR-ACCOUNT.workers.dev/ \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"get_telos","arguments":{}},"id":2}'
```

### Custom MCP Domain (Optional)

To use a custom subdomain like `mcp.daemon.yourdomain.com`:

1. Add DNS CNAME record pointing to `daemon-mcp.YOUR-ACCOUNT.workers.dev`
2. Update `wrangler.jsonc`:
   ```json
   "routes": [
     { "pattern": "mcp.daemon.yourdomain.com", "custom_domain": true }
   ]
   ```
3. Redeploy: `npx wrangler deploy`

### Update API Documentation

After deploying MCP server, update your `/api` page:
- Change base URL from placeholder to your MCP endpoint
- Update examples with your actual URL

---

## 7. Custom Domain (Optional)

1. Open Cloudflare Dashboard → Workers & Pages → Your Project → Custom Domains
2. Add your domain (must use Cloudflare DNS)
3. Cloudflare provisions SSL automatically

---

## Branch Previews

Deploy from non-main branches to create preview URLs:

| Branch | URL |
|--------|-----|
| `main` | `https://your-project.pages.dev` (production) |
| `feature-x` | `https://feature-x.your-project.pages.dev` (preview) |

---

## Verification Checklist

Run through this checklist after setup:

### Files Personalized

- [ ] `public/daemon.md` contains your identity (grep returns 0 "danielmiessler" matches)
- [ ] `wrangler.toml` has your project name
- [ ] `DaemonDashboard.tsx` shows your identifier at line 136
- [ ] `DaemonDashboard.tsx` `daemonData` object has your content

### Deployment Working

- [ ] `.env` exists with `CLOUDFLARE_API_TOKEN`
- [ ] `bun run build` succeeds without errors
- [ ] `wrangler pages deploy dist` succeeds
- [ ] Production URL loads in browser
- [ ] Dashboard shows your identifier (not `CONTEXT-YOU-KEEP`)
- [ ] `/telos` page shows your TELOS (not Daniel's)

### Cleanup Complete

- [ ] `README.md` has no `danielmiessler.com` links (or shows "forked from" attribution only)
- [ ] `grep -r "danielmiessler" src/` returns no results

### MCP Server Working (Optional)

- [ ] MCP worker deployed to `daemon-mcp.YOUR-ACCOUNT.workers.dev`
- [ ] `tools/list` returns your tools (14 tools)
- [ ] `tools/call` with `get_telos` returns your TELOS content
- [ ] `/api` page updated with your MCP endpoint URL

---

## Troubleshooting

### "Uncommitted changes" warning

Wrangler warns about dirty git state. Either commit first or add `--commit-dirty=true` to silence.

### OAuth login prompt

Wrangler cannot find your API token. Verify:
1. `.env` exists in project root
2. `.env` contains `CLOUDFLARE_API_TOKEN=...`
3. Token has "Edit Cloudflare Workers" permissions

### Account ID prompt

Wrangler prompts for account ID on first deploy. Select your account; Wrangler caches the choice in `node_modules/.cache/wrangler/wrangler-account.json`.

### 405 on /api endpoint

The `/api` page is documentation only. The actual MCP server runs as a separate Cloudflare Worker. Deploy the MCP server (see Section 6) to enable JSON-RPC API access.

### Site shows wrong content after deploy

Clear Cloudflare cache: Dashboard → Your Project → Caching → Purge Cache.

---

## Architecture Notes

See `docs/adr/001-identity-data-architecture.md` for:
- Why data duplicates across files (and the planned fix)
- Build-time parser proposal for single source of truth
- MCP server architecture (optional)

---

*Last updated: 2026-01-09*
