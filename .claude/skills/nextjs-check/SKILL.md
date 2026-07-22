---
name: nextjs-check
description: Consult the locally installed Next.js docs (node_modules/next/dist/docs/) before writing or modifying App Router / Next.js-specific code, since this repo pins a Next.js version newer than the model's training data and conventions may differ. Use before touching app/ routing, layouts, server/client component boundaries, config, or any Next.js API you're not certain about for this version.
---

This repo pins a Next.js version (check `next` in `package.json`) that is likely newer than your training data. Conventions, APIs, and file structure may have changed.

1. Check the installed version: read the `next` entry in `package.json`.
2. Before writing or editing any App Router code (`app/**`, `next.config.ts`, routing, layouts, server actions, metadata, server/client component boundaries), search `node_modules/next/dist/docs/` for the relevant topic rather than relying on memorized conventions.
3. Heed any deprecation notices found there — this repo's `AGENTS.md` explicitly warns that APIs and conventions may differ from what you expect.
4. If the docs don't cover the specific question, say so explicitly rather than guessing at behavior from an older Next.js version.
