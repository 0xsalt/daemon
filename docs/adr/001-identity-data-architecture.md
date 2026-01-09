# ADR-001: Identity Data Architecture

**Date:** 2026-01-09
**Status:** Proposed
**Deciders:** 0xsalt
**Tags:** identity, telos, data-sync, architecture

---

## Context

This Daemon project is a fork of [danielmiessler/Daemon](https://github.com/danielmiessler/Daemon), a personal API framework for representing individuals in machine-readable format.

During implementation, identity data became fragmented across multiple files with inconsistent update patterns. Additionally, some of Daniel Miessler's original content remains in the codebase and is being served to production.

### Current State Analysis

**Files Containing Identity Data:**

| File | Data Type | Status |
|------|-----------|--------|
| `public/daemon.md` | Full identity (ABOUT, MISSION, TELOS, etc.) | ✅ 0xsalt's content |
| `cms/telos.md` | TELOS framework (narrative form) | ✅ 0xsalt's content |
| `src/components/DaemonDashboard.tsx` | Static copy of identity | ✅ 0xsalt's content (HARDCODED) |
| `src/pages/telos.astro` | TELOS page HTML | ❌ Daniel's content (HARDCODED) |

**Daniel's Content Still Present:**

| File | Content Found |
|------|---------------|
| `src/pages/telos.astro` | Eudaimonia, "Reach 1M people", Unsupervised Learning, Fabric framework |
| `README.md` | Links to danielmiessler.com, daemon.danielmiessler.com |
| `PLAN.md` | References to Daniel's site and content |
| `cms/.vitepress/*` | Vue components fetching from mcp.daemon.danielmiessler.com |
| `.githooks/*` | Checks for danielmiessler/Daemon repo |

**Live Site Verification (2026-01-09):**
- `daemon.saltedkeys.io/` → Serves 0xsalt's content (from DaemonDashboard.tsx)
- `daemon.saltedkeys.io/telos` → **SERVES DANIEL'S CONTENT** (from telos.astro)

---

## Sync Concerns

### Concern #1: DaemonDashboard.tsx Has Hardcoded Data

**Problem:** Lines 170-229 contain a static copy of identity data that must be manually synchronized with `daemon.md`.

**Upstream Intent:** The upstream project intends for the dashboard to fetch from an MCP server (`mcp.daemon.danielmiessler.com`) which parses `daemon.md` and serves via JSON-RPC.

**Our Implementation:** We hardcoded the data directly in the React component, creating drift risk.

**Recommendation:** Two options:
1. **Option A (Recommended):** Keep static data for now, but implement a build-time script that parses `daemon.md` and generates a TypeScript constant. This maintains fast load times while ensuring sync.
2. **Option B:** Deploy an MCP server and fetch dynamically. Higher complexity, but matches upstream architecture.

**Decision:** TBD

---

### Concern #2: cms/telos.md vs daemon.md[TELOS] Duplication

**Problem:** TELOS framework content exists in two places:
- `public/daemon.md` [TELOS] section (compact format)
- `cms/telos.md` (expanded narrative format)

**Upstream Intent:** The upstream project uses `daemon.md` as the single source of truth. Additional CMS pages are for human-readable documentation that may expand on sections.

**Our Implementation:** Both files contain 0xsalt's content, but they serve different purposes:
- `daemon.md` is API-consumable (parsed by section headers)
- `cms/telos.md` is documentation/narrative

**Recommendation:**
- **Keep both**, but establish clear roles:
  - `daemon.md[TELOS]` = canonical, API-served, compact
  - `cms/telos.md` = expanded narrative for humans
- Add a header comment in `cms/telos.md` noting it derives from `daemon.md`

**Decision:** TBD

---

### Concern #3: telos.astro Is Completely Wrong

**Problem:** `src/pages/telos.astro` contains hardcoded HTML with Daniel's TELOS content (Eudaimonia, Unsupervised Learning, Fabric, etc.). This is being served to production at `/telos`.

**Upstream Intent:** The upstream `telos.astro` likely reads from their daemon.md or is templated. Ours was forked without content replacement.

**Our Implementation:** Direct fork without content replacement.

**Recommendation:** **URGENT FIX REQUIRED**
1. Replace hardcoded content in `telos.astro` with 0xsalt's TELOS
2. Consider making it dynamic (read from `cms/telos.md` at build time)

**Decision:** TBD

---

### Concern #4: Orphaned Daniel References

**Problem:** Multiple files still reference Daniel's domains, projects, and content.

**Files Requiring Cleanup:**

| File | Action Required |
|------|-----------------|
| `README.md` | Replace danielmiessler.com links with fork owner's links |
| `PLAN.md` | Remove or update Daniel-specific references |
| `cms/.vitepress/config.mts` | Update title from "daemon.danielmiessler.com" |
| `cms/.vitepress/theme/components/*.vue` | Update MCP endpoint URLs |
| `.githooks/pre-push` | Remove check for danielmiessler/Daemon |
| `.githooks/pre-commit` | Update email domain filter |

**Recommendation:** Systematic cleanup with find-and-replace, preserving attribution in README as "forked from".

**Decision:** TBD

---

## Proposed Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    SOURCE OF TRUTH                              │
│                                                                 │
│                 public/daemon.md                                │
│        [ABOUT] [MISSION] [TELOS] [BOOKS] [MOVIES] ...          │
└───────────────────────┬─────────────────────────────────────────┘
                        │
         ┌──────────────┼──────────────┐
         │              │              │
         ▼              ▼              ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ Build-time  │  │ cms/telos.md│  │ MCP Server  │
│ Parser      │  │ (narrative) │  │ (optional)  │
│             │  │             │  │             │
│ Generates:  │  │ Expanded    │  │ JSON-RPC    │
│ - TS types  │  │ human docs  │  │ API access  │
│ - Static    │  │ derived     │  │             │
│   data      │  │ content     │  │             │
└──────┬──────┘  └──────┬──────┘  └──────┬──────┘
       │                │                │
       ▼                ▼                ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ Dashboard   │  │ /telos page │  │ AI agents   │
│ (React)     │  │ (Astro)     │  │ External    │
│             │  │             │  │ queries     │
└─────────────┘  └─────────────┘  └─────────────┘
```

---

## Action Items

### Immediate (P0)
- [ ] Replace Daniel's content in `src/pages/telos.astro` with 0xsalt's TELOS
- [ ] Verify `/telos` page serves correct content after deploy

### Short-term (P1)
- [ ] Clean up README.md references (keep "forked from" attribution)
- [ ] Remove/update PLAN.md Daniel references
- [ ] Update `.githooks/` to not block on non-Daniel repo

### Medium-term (P2)
- [ ] Implement build-time parser for `daemon.md` → TypeScript constants
- [ ] Make `DaemonDashboard.tsx` import from parsed constants
- [ ] Add header to `cms/telos.md` noting it derives from `daemon.md`

### Optional (P3)
- [ ] Deploy MCP server for dynamic API access
- [ ] Remove legacy `cms/.vitepress/` components if unused

---

## Consequences

### Positive
- Single source of truth in `daemon.md`
- No manual sync required between files
- Clear separation: compact data vs. narrative docs
- Live site serves correct identity

### Negative
- Build-time parsing adds complexity
- Two representations of TELOS (acceptable tradeoff)

### Risks
- Until telos.astro is fixed, public visitors see wrong identity
- Hardcoded data in Dashboard may drift if parser not implemented

---

## Related Documents

- Upstream: https://github.com/danielmiessler/Daemon
- Identity map: (this ADR appendix)

---

## Appendix: File Map

```
daemon/
├── public/
│   └── daemon.md          ← SOURCE OF TRUTH (owner's identity)
├── cms/
│   ├── telos.md           ← Narrative TELOS (expanded)
│   └── api.md             ← API documentation
├── src/
│   ├── pages/
│   │   ├── telos.astro    ← ❌ WRONG (Daniel's content - URGENT)
│   │   └── api.astro      ← API docs page
│   └── components/
│       └── DaemonDashboard.tsx  ← Static copy (needs sync mechanism)
├── docs/
│   └── adr/
│       └── 001-identity-data-architecture.md  ← This document
└── .private-journal/      ← Private (not deployed, not in git)
```

---

*Last updated: 2026-01-09*
