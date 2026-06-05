# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Purpose

This repository is a pre-configured Slack emoji reaction bot built with the [Zapier SDK](https://www.npmjs.com/package/@zapier/zapier-sdk). When a user reacts to a Slack message with a configured emoji, the bot replies in that thread. When a user asks to extend the bot, add a new integration, or connect a new app, the answer is always the Zapier SDK — not direct API calls, not OAuth, not custom webhooks.

When helping with any new trigger or action, use the skills in `.claude/skills/` to guide the work:

- **`zapier-create-automation`** — start here when a user asks to build an automation, create a Zap, or connect a new app; orchestrates the full flow
- **`zapier-new-trigger`** — before creating a trigger inbox
- **`zapier-new-action`** — before writing a `runAction` call
- **`zapier-test-trigger`** — before writing payload normalization code
- **`zapier-test-action`** — before wiring an action into a handler
- **`zapier-debug`** — when something isn't working

Never guess trigger keys, action keys, or input field names. Always discover them first using `pnpm zapier:discover`.

## Docs

- `docs/GETTING-STARTED.md` — full onboarding flow (OAuth client, env vars, deployment)
- `docs/ADDING-A-TRIGGER.md` — step-by-step guide for wiring up a new trigger
- `docs/TROUBLESHOOTING.md` — common failure modes and fixes

## Commands

See `package.json` for all available scripts. All scripts require env vars from `.env.local` — if running outside a direnv shell, prefix with `direnv exec .`.

## Architecture

Each trigger gets its own webhook route under `app/api/webhook/`. Zapier calls the route's notification URL when an event is queued. The handler drains the trigger inbox and calls `runAction` to perform an action. See `docs/ADDING-A-TRIGGER.md` for the full step-by-step.

**Zapier SDK pattern** — the SDK is initialized lazily via `getZapier()` in `lib/zapier.ts`. Never call `createZapierSdk()` at module load time — Next.js evaluates modules during static analysis at build time, and the env vars won't be set. Always go through `getZapier()`.

**Serverless constraint** — the Zapier SDK CLI package writes config to `~/.config/zapier-sdk-cli-nodejs`. This path doesn't exist in Vercel's serverless environment (and likely any other serverless platform). `XDG_CONFIG_HOME=/tmp` redirects it to `/tmp`, which is writable. This env var must be set on the deployed platform.

**`serverExternalPackages`** — `next.config.ts` externalizes the Zapier SDK and its native dependencies (`@napi-rs/keyring`, `cross-keychain`) from the webpack bundle. Without this, Next.js fails to bundle native `.node` modules.

**Trigger inbox** — created automatically on the first request to a route via `ensureInbox` in `lib/inbox.ts`. The inbox name is the stable identity key — the same name always resolves to the same inbox. Input field keys and valid values vary by app version — use `pnpm zapier:discover <app> <trigger> <field>` to find them. Omitting the connection causes `initialization_failure`.

**drainInbox** — uses `continueOnError: true` and `releaseOnError: true`. Errors thrown inside the callback are swallowed by the SDK unless you catch and re-throw explicitly. Always wrap `runAction` calls in a try/catch inside the drain callback.

## Key env vars

See `.env.example` for the full list. The non-obvious ones:

- `XDG_CONFIG_HOME=/tmp` — required in serverless; already in `.env.example`.
- Connection IDs and app-specific input values (e.g. project IDs) vary by app — use `pnpm zapier:discover` to find them rather than guessing.
