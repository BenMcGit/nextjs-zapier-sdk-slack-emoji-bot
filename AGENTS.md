@CLAUDE.md

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Zapier SDK

All Zapier SDK calls go through `getZapier()` in `lib/zapier.ts` — never instantiate the SDK directly. The SDK is imported from `@zapier/zapier-sdk/experimental`.

When discovering correct trigger/action keys or input field formats, use the scripts rather than guessing:
- `pnpm zapier:discover <app>` to list keys
- `pnpm zapier:discover <app> <trigger> <field>` to list valid input values

## Scripts

The `scripts/` directory contains CLI tools for managing Zapier resources. They are not part of the app runtime. Prefix all script runs with `direnv exec .` to load `.env.local`.

Temporary inspection scripts (prefixed `_`) are for one-time debugging and should be deleted after use.
