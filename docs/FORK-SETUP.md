# Fork Setup Guide

> Active checklist for this deployment. Becomes AI-followable template when complete.

**Status:** In progress

---

## Steps

- [ ] Update README.md links (currently point to danielmiessler.com)
- [ ] Update or remove PLAN.md (contains upstream-specific content)
- [ ] Update git hooks (`.githooks/pre-push` checks for wrong repo, `pre-commit` filters wrong email)
- [ ] Update VitePress config title (`cms/.vitepress/config.mts`)
- [ ] Update or remove Vue MCP components (`cms/.vitepress/theme/components/DaemonDashboard.vue*`)

---

*When all steps complete: update status, generalize for other forkers, mark done in BACKLOG.md.*
