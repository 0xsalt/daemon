# Roadmap

Future features and improvements for this Daemon fork.

Items graduate here from internal brainstorming once they're ready for implementation.

---

## Planned

### Make daemon.md the true single source of truth
**Target: Upstream contribution**

Currently personal content is scattered across multiple files due to static data workaround:
- `public/daemon.md` (canonical)
- `src/components/DaemonDashboard.tsx` (hardcoded copy)
- `src/components/Hero.tsx` (hardcoded tagline/location)
- `cms/telos.md` (narrative expansion)

**Proposed fix:**
1. Build-time parser reads `daemon.md`
2. Generates TypeScript constants (`src/data/daemon-data.ts`)
3. Dashboard and Hero import from generated file
4. Add `daemon.md.example` template, gitignore `daemon.md`

**Benefits:**
- One file to customize when forking
- No accidental PR of personal content
- Cleaner architecture for everyone

---

## Under Consideration

*(No items yet)*

---

## Completed

*(No items yet)*

---

*Last updated: 2026-01-09*
