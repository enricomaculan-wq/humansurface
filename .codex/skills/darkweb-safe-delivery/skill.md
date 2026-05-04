---
name: darkweb-safe-delivery
description: Safely modify the HumanSurface dark web module with incremental changes, build-safe validation, path checks, and consolidation-first behavior.
---

Use this skill whenever a task touches HumanSurface dark web code and there is a risk of breaking the build, duplicating modules, or introducing inconsistent patterns.

Safety goals:
- do not break build
- do not duplicate existing dark-web logic
- do not mix experimental code with stable product code without clear boundaries
- do not change client-facing behavior unless requested

Mandatory workflow:
1. Search the codebase for existing dark-web files before writing new code.
2. Prefer consolidation over duplication.
3. Verify import paths carefully, especially in nested app-router folders.
4. Keep server/client boundaries valid.
5. Keep page.tsx files Next.js-compatible.
6. Avoid duplicate object keys and invalid exports.
7. When changing routes or admin pages, ensure typing stays App Router safe.
8. After each step, run a consistency check:
   - imports
   - types
   - route handler shape
   - likely build issues

When proposing changes:
- list touched files
- explain why each file changes
- call out migration SQL separately
- mention rollback or follow-up steps if needed

When uncertain:
- inspect first
- do not guess paths or file names
- prefer a small patch over a broad rewrite