# Known Issues

Identified during fork customization audit (2026-01-09).

See `docs/adr/001-identity-data-architecture.md` for full analysis.

---

## P0 - Critical (Blocking)

### ISSUE-001: /telos page serves Daniel's content
- **File:** `src/pages/telos.astro`
- **Problem:** Hardcoded HTML contains upstream author's TELOS framework
- **Impact:** Live site at `/telos` displays wrong identity
- **Evidence:** Contains "Eudaimonia", "Unsupervised Learning", "Reach 1M people", "Fabric framework"
- **Fix:** Replace hardcoded content with owner's TELOS from `public/daemon.md`

---

## P1 - High Priority

### ISSUE-002: README.md references upstream author
- **File:** `README.md`
- **Problem:** Links to danielmiessler.com, daemon.danielmiessler.com
- **Fix:** Update links, keep "forked from" attribution

### ISSUE-003: PLAN.md references upstream author
- **File:** `PLAN.md`
- **Problem:** Contains Daniel-specific content and references
- **Fix:** Remove or update to reflect this fork's goals

### ISSUE-004: Git hooks check for wrong repository
- **Files:** `.githooks/pre-push`, `.githooks/pre-commit`
- **Problem:** Pre-push checks for `danielmiessler/Daemon` repo
- **Problem:** Pre-commit filters `@danielmiessler.com` emails
- **Fix:** Update or remove these checks

### ISSUE-005: VitePress config has upstream branding
- **File:** `cms/.vitepress/config.mts`
- **Problem:** Title set to "daemon.danielmiessler.com"
- **Fix:** Update to reflect this fork

### ISSUE-006: Vue components fetch from upstream MCP
- **Files:** `cms/.vitepress/theme/components/DaemonDashboard.vue*`
- **Problem:** Hardcoded URLs to `mcp.daemon.danielmiessler.com`
- **Fix:** Update URLs or remove if unused

---

## P2 - Medium Priority

### ISSUE-007: DaemonDashboard.tsx has static data copy
- **File:** `src/components/DaemonDashboard.tsx`
- **Problem:** Identity data hardcoded in React component (lines 170-229)
- **Risk:** Can drift from `public/daemon.md` source of truth
- **Fix:** Implement build-time parser to generate TypeScript constants from daemon.md

### ISSUE-008: API documentation has placeholder URLs
- **File:** `cms/api.md`
- **Problem:** Uses `YOUR_DOMAIN_HERE` placeholder throughout
- **Fix:** Update to `daemon.saltedkeys.io` or keep generic for fork users

### ISSUE-009: Duplicate TELOS representations
- **Files:** `public/daemon.md[TELOS]`, `cms/telos.md`
- **Problem:** Two versions of TELOS content (compact vs narrative)
- **Risk:** Can drift apart
- **Fix:** Add derivation note to cms/telos.md, consider build-time generation

---

## P3 - Low Priority / Optional

### ISSUE-010: Legacy VitePress components
- **Files:** `cms/.vitepress/theme/components/*.vue`
- **Problem:** May be unused if Astro is primary frontend
- **Fix:** Audit usage, remove if dead code

### ISSUE-011: No MCP server deployed
- **Problem:** Upstream architecture expects MCP server for API access
- **Current state:** Dashboard uses static data instead
- **Fix:** Optional - deploy MCP server if dynamic API needed

### ISSUE-012: N2 (30-second version) is blank
- **File:** `public/daemon.md` (or equivalent)
- **Problem:** The "elevator pitch" / 30-second summary is missing
- **Impact:** No quick intro for new visitors or AI agents
- **Fix:** Write a concise N2 narrative

### ISSUE-013: Predictions section is empty
- **File:** `public/daemon.md[PREDICTIONS]`
- **Problem:** Section exists but shows "(To be added — currently observing, not predicting)"
- **Status:** Intentional, but visible to visitors
- **Fix:** Either populate or hide until ready

### ISSUE-014: No "Currently" section
- **Problem:** No way to show current focus/projects (monthly updates)
- **Impact:** Visitors see static long-term goals but not active work
- **Fix:** Consider adding [CURRENTLY] section to daemon.md schema

### ISSUE-015: Daemon API returns 405 (not live)
- **Endpoint:** `daemon.saltedkeys.io` MCP API
- **Problem:** API calls return HTTP 405 - server not responding to JSON-RPC
- **Impact:** External tools (like Daemon Watch) can't subscribe to our daemon
- **Evidence:** External daemon subscribers report API returns 405
- **Fix:** Deploy MCP server or configure Cloudflare Worker to handle JSON-RPC

---

## Resolved

*(Move issues here after fixing)*

---

*Last updated: 2026-01-09*
