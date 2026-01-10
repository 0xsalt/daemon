# Research: MCP Server API 405 Error

**Date:** 2026-01-09
**Branch:** dev/mcp-server-api-405
**Status:** Research Complete
**Updated:** Added findings from AJ's daemon-watch analysis

---

## Problem Statement

The `/api` page documents JSON-RPC endpoints, but POST requests return 405 (Method Not Allowed).

```bash
curl -X POST https://saltedkeys.pages.dev/api/ \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":1}'
# Returns: HTTP 405
```

---

## Key Finding: Separate MCP Subdomain

**Daniel's MCP server runs on a separate subdomain**, not the main site:

| URL | Method | Result |
|-----|--------|--------|
| `daemon.danielmiessler.com/` | POST | 404 (static site) |
| `mcp.daemon.danielmiessler.com/` | POST | **200 (MCP server working!)** |

```bash
# This works:
curl -X POST https://mcp.daemon.danielmiessler.com/ \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":1}'

# Returns 13 tools including get_about, get_telos, get_mission, etc.
```

**Source:** AJ's daemon-watch system successfully fetches from Daniel's daemon via `mcp.daemon.danielmiessler.com`. AJ disabled saltedkeys in his script because our API returns 405.

---

## Architecture: Two Separate Services

Daniel runs **two independent Cloudflare deployments**:

```
┌─────────────────────────────────────────────────────────────┐
│                    DANIEL'S ARCHITECTURE                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  daemon.danielmiessler.com     mcp.daemon.danielmiessler.com │
│  ┌──────────────────────┐      ┌──────────────────────────┐  │
│  │   Cloudflare Pages   │      │   Cloudflare Worker      │  │
│  │   (Static Site)      │      │   (MCP JSON-RPC Server)  │  │
│  │                      │      │                          │  │
│  │   - Astro website    │      │   - Parses daemon.md     │  │
│  │   - Dashboard UI     │      │   - JSON-RPC 2.0 API     │  │
│  │   - /api docs page   │      │   - tools/list           │  │
│  │                      │      │   - tools/call           │  │
│  └──────────────────────┘      └──────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**What we have:**
- `saltedkeys.pages.dev` - Static site (working)

**What we need:**
- `mcp.saltedkeys.pages.dev` or similar - MCP server (not deployed)

---

## Where is Daniel's MCP Code?

The MCP server code is **NOT in the public Daemon repo**. The upstream `src/worker.ts` only serves static assets:

```typescript
// upstream/main:src/worker.ts - NOT an MCP server
export default {
  async fetch(request: Request, env: any, ctx: any): Promise<Response> {
    return await getAssetFromKV(...);  // Static files only
  }
};
```

Daniel likely has the MCP worker in a private repo or deployed separately. The README notes:
> "The MCP server code and setup instructions will be documented separately."

---

## Cloudflare MCP Server Implementation

### Option 1: Use Cloudflare's MCP Template (Recommended)

Cloudflare provides ready-to-deploy MCP server templates:

```bash
# Create authless MCP server
npm create cloudflare@latest -- daemon-mcp \
  --template=cloudflare/ai/demos/remote-mcp-authless

cd daemon-mcp
npm start  # Local dev at http://localhost:8788/sse
```

**Deploy:**
```bash
npx wrangler@latest deploy
# Live at: daemon-mcp.your-account.workers.dev/sse
```

### Option 2: Custom Worker with daemon.md Parser

For Daemon-specific implementation, create a worker that:
1. Fetches `daemon.md` from KV or static storage
2. Parses sections by `[SECTION_NAME]` headers
3. Implements `tools/list` and `tools/call` JSON-RPC methods

```typescript
// src/mcp-server.ts
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    const { method, params, id } = await request.json();
    const daemonMd = await env.DAEMON_KV.get('daemon.md');
    const sections = parseDaemonMd(daemonMd);

    switch (method) {
      case 'tools/list':
        return jsonRpc(id, { tools: generateToolsList(sections) });
      case 'tools/call':
        const content = sections[params.name.replace('get_', '').toUpperCase()];
        return jsonRpc(id, { content: [{ type: 'text', text: content }] });
      default:
        return jsonRpcError(id, -32601, 'Method not found');
    }
  }
};
```

---

## Cloudflare Hosting Options

| Option | URL Pattern | Setup |
|--------|-------------|-------|
| **Workers subdomain** | `daemon-mcp.your-account.workers.dev` | Automatic with deploy |
| **Custom subdomain** | `mcp.saltedkeys.io` | Add route in Cloudflare DNS |
| **Path on Pages** | `saltedkeys.pages.dev/mcp` | Requires Pages Functions |

**Recommended:** Separate Worker on custom subdomain (`mcp.daemon.saltedkeys.io`) to match Daniel's architecture.

---

## Implementation Plan

### Phase 1: Deploy Basic MCP Server

1. Create new Worker project using Cloudflare template
2. Customize to parse `daemon.md` format
3. Deploy to `mcp.saltedkeys.pages.dev` or `mcp.daemon.saltedkeys.io`
4. Test with curl

### Phase 2: Integrate with Static Site

5. Update `/api` page to point to MCP endpoint
6. Update dashboard to fetch from MCP server (optional)

### Phase 3: Enable for AJ's Daemon Watch

7. Notify AJ to flip `enabled: True` for saltedkeys
8. Verify daily fetch works

---

## wrangler.toml for MCP Worker

```toml
name = "daemon-mcp"
main = "src/index.ts"
compatibility_date = "2025-01-09"

# Optional: KV for caching daemon.md
[[kv_namespaces]]
binding = "DAEMON_KV"
id = "your-kv-namespace-id"

# Custom domain route (after DNS setup)
routes = [
  { pattern = "mcp.daemon.saltedkeys.io", custom_domain = true }
]
```

---

## Testing

```bash
# Test tools/list
curl -X POST https://mcp.daemon.saltedkeys.io/ \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":1}'

# Test tools/call
curl -X POST https://mcp.daemon.saltedkeys.io/ \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"get_telos","arguments":{}},"id":2}'
```

---

## Sources

- [Cloudflare: Build a Remote MCP Server](https://developers.cloudflare.com/agents/guides/remote-mcp-server/)
- [Daniel Miessler: One-Click MCP Servers](https://danielmiessler.com/blog/one-click-mcp-servers-cloudflare)
- [GitHub: danielmiessler/Daemon](https://github.com/danielmiessler/Daemon)
- [GitHub: cloudflare/workers-mcp](https://github.com/cloudflare/workers-mcp)
- [MCP Specification](https://modelcontextprotocol.io)

---

*Research completed: 2026-01-09*
