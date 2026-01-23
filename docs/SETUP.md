# Daemon Setup Guide

This guide explains how to configure your personal Daemon site.

## Quick Start

1. **Copy the example template to your config directory:**

   ```bash
   mkdir -p ~/.config/daemon
   cp public/daemon.example.md ~/.config/daemon/daemon.md
   ```

2. **Edit with your personal content:**

   ```bash
   $EDITOR ~/.config/daemon/daemon.md
   ```

3. **Build and preview:**

   ```bash
   bun run parse-daemon  # Generate TypeScript from daemon.md
   bun run dev           # Start dev server
   ```

4. **Deploy:**

   ```bash
   bun run build
   wrangler pages deploy dist/
   ```

## Path Resolution

The parser looks for `daemon.md` in this order:

1. `$DAEMON_MD_PATH` - Environment variable override
2. `$XDG_CONFIG_HOME/daemon/daemon.md` - XDG standard config
3. `~/.config/daemon/daemon.md` - Default XDG path
4. `public/daemon.example.md` - Fallback for development

### Environment Variable Override

For CI/CD or custom setups:

```bash
DAEMON_MD_PATH=/path/to/my/daemon.md bun run parse-daemon
```

## File Format

`daemon.md` uses a simple section-based format:

```markdown
[SECTION_NAME]

Content for this section...

[ANOTHER_SECTION]

More content...
```

### Available Sections

| Section | Required | Description |
|---------|----------|-------------|
| `ABOUT` | Yes | Brief introduction |
| `MISSION` | Yes | Your purpose (first sentence becomes subtitle) |
| `CURRENT_LOCATION` | No | Timezone or general location |
| `TELOS` | No | Purpose framework (P#, M#, G# items) |
| `WHAT_IM_BUILDING` | No | Current projects (bullet list) |
| `WHO_I_AM` | No | Extended narrative |
| `FAVORITE_BOOKS` | No | Book list |
| `FAVORITE_MOVIES` | No | Movie list |
| `FAVORITE_TV` | No | TV shows |
| `PREFERENCES` | No | Work preferences (bullet list) |
| `DAILY_ROUTINE` | No | How you work |
| `PROJECTS` | No | Project list |
| `RESUME` | No | Professional summary |
| `CONTACT` | No | How to reach you |
| `PHILOSOPHY` | No | Guiding principles |

### Unpublished Sections

Add `.unpublished` suffix to parse but exclude from output:

```markdown
[PROJECTS].unpublished

Private project notes here...
```

### Last Updated

Include a footer for tracking:

```markdown
---

*Last updated: 2026-01-22*
```

## Build Process

```
~/.config/daemon/daemon.md     # Your personal content
         |
         v
[bun run parse-daemon]         # Parser reads XDG path
         |
         v
src/generated/daemon-data.ts   # Generated (gitignored)
         |
         v
[bun run build]                # Astro builds site
         |
         v
dist/                          # Static output
```

## Deployment

### Cloudflare Pages (Recommended)

```bash
bun run build
wrangler pages deploy dist/
```

### Custom Domain

Configure in Cloudflare Pages dashboard or via wrangler.toml.

## Keeping Content Private

Your `daemon.md` lives in `~/.config/daemon/`, not in the repo:

- The repo contains only the framework (publishable)
- Your personal content stays on your machine
- `dist/` is gitignored - built output never commits
- You can safely push to public GitHub

## Syncing with Upstream

This fork tracks [danielmiessler/Daemon](https://github.com/danielmiessler/Daemon):

```bash
git fetch upstream
git checkout upstream-main
git merge upstream/main
git checkout main
git merge upstream-main
```

Framework improvements can be merged without affecting your personal content.
