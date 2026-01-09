# Changelog

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) + [SemVer](https://semver.org/spec/v2.0.0.html)

## [Unreleased]

### Fixed
- *(pending)* /telos page content (src/pages/telos.astro still has upstream content)

## [1.1.0] - 2026-01-09

Identity customization and deployment configuration.

### Added
- Branching strategy documented in CLAUDE.md
- Roadmap: "daemon.md as single source of truth" for upstream contribution

### Changed
- Identity content replaced in daemon.md, DaemonDashboard.tsx, Hero.tsx, cms/telos.md
- Deployment configured for Cloudflare Pages ("context-you-keep")
- API docs updated with placeholder URLs
- Branding updated to "The Context You Keep"

## [1.0.1] - 2026-01-09

Fork setup and documentation.

### Added
- Architecture decision records (ADR-001)
- Project standards in CLAUDE.md
- Issue tracking (docs/ISSUES.md)
- Roadmap placeholder (docs/ROADMAP.md)

### Changed
- Git remote points to 0xsalt/daemon fork
- Upstream tracked as separate remote

## [1.0.0] - 2026-01-09

Initial fork from [danielmiessler/Daemon](https://github.com/danielmiessler/Daemon).

Upstream had no releases; 1.0.0 establishes baseline. Includes Astro site, daemon.md identity format, dashboard, TELOS page, API docs, and Cloudflare Pages config.

See `docs/ISSUES.md` for known issues.

[Unreleased]: https://github.com/0xsalt/daemon/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/0xsalt/daemon/compare/v1.0.1...v1.1.0
[1.0.1]: https://github.com/0xsalt/daemon/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/0xsalt/daemon/releases/tag/v1.0.0
