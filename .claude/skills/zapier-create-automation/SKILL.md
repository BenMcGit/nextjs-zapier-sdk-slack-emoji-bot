---
name: zapier-create-automation
description: Use when the user asks to create an automation, build a Zap, wire up a new trigger, or connect a new app. Orchestrates the full trigger → action workflow using the component skills and docs.
---

# Creating a New Automation

This skill orchestrates the full end-to-end flow for adding an automation to this bot. It sequences the component skills in the right order and points you to the right docs at each step.

Before writing any code, you must understand:
1. **What event triggers the automation** — the source app and event type
2. **What action it performs** — the destination app and what it does

If either is unclear, ask the user before proceeding.

---

## Phase 1: Plan

Confirm with the user:
- **Trigger**: Which app sends the event? What is the event (e.g. new message, new record, form submitted)?
- **Action**: Which app receives the action? What does it do (e.g. send a message, create a task, post a comment)?

One automation = one trigger + one action. If the user describes something with multiple triggers or actions, scope the first automation and flag the rest for follow-up.

---

## Phase 2: Set up the trigger

Follow the **`zapier-new-trigger`** skill in full before writing any trigger code.

Key steps from that skill:
1. `direnv exec . pnpm zapier:discover <app>` — find the exact trigger key
2. `direnv exec . pnpm zapier:discover <app> <trigger-key>` — find required input fields
3. `direnv exec . pnpm zapier:discover <app> <trigger-key> <field-key>` — find valid values for each field
4. Get the connection ID from `direnv exec . pnpm zapier:connections`
5. Add `defineTrigger(...)` to `lib/triggers.ts`, add the env var to `lib/env.ts` and `.env.example`

See `docs/ADDING-A-TRIGGER.md` for the full annotated walkthrough.

---

## Phase 3: Inspect the trigger payload

Follow the **`zapier-test-trigger`** skill before writing any normalization code.

Fire a real event in the source app, then:

```bash
direnv exec . pnpm zapier:trigger-sample <app> <trigger-key>
```

Do not write a normalization function until you have seen a real payload. Field names and nesting are not predictable from the app name alone.

---

## Phase 4: Verify the action

Follow the **`zapier-test-action`** skill before wiring the action into the handler.

```bash
direnv exec . pnpm zapier:run-action <app> <action-key> '<json-inputs>'
```

Confirm the action succeeds and inspect the response shape before writing the handler.

---

## Phase 5: Create the webhook route

Create `app/api/webhook/<slug>/route.ts`. Follow the pattern from any existing route — the structure is always:

1. Validate the webhook token
2. `trigger.resolveInbox()` to get the inbox ID
3. `drainInbox()` with a callback that:
   - Normalizes the raw payload
   - Builds the outgoing data
   - Calls `getZapier().runAction(...)` inside a try/catch

The inbox is created automatically on the first request. The `notificationPath` in your `defineTrigger` call must match this route path exactly.

> **Serverless reminder**: `runAction` errors inside `drainInbox` are swallowed unless you catch and re-throw. Always wrap in try/catch.

---

## Phase 6: Deploy and verify

1. Set the new env var(s) in your deployment environment (Vercel → Project Settings → Environment Variables). Include `XDG_CONFIG_HOME=/tmp` if not already set.
2. Push and deploy.
3. Fire a real event to trigger the webhook.
4. Check inbox status:

```bash
direnv exec . pnpm zapier:inboxes
```

The inbox must show `active`. If it shows `initialization_failure`, switch to the **`zapier-debug`** skill.

---

## Quick reference

| Task | Command |
|------|---------|
| List triggers / actions for an app | `direnv exec . pnpm zapier:discover <app>` |
| List input fields for a trigger | `direnv exec . pnpm zapier:discover <app> <trigger>` |
| List valid values for a field | `direnv exec . pnpm zapier:discover <app> <trigger> <field>` |
| List connected accounts | `direnv exec . pnpm zapier:connections` |
| Peek at queued trigger payload | `direnv exec . pnpm zapier:trigger-sample <app> <trigger>` |
| Fire an action directly | `direnv exec . pnpm zapier:run-action <app> <action> '<json>'` |
| Check inbox status | `direnv exec . pnpm zapier:inboxes` |
| Delete an inbox (to reset it) | `direnv exec . pnpm zapier:delete-inbox <name-or-id>` |

---

## If something goes wrong

Switch to the **`zapier-debug`** skill. Start with `pnpm zapier:inboxes` — the inbox status tells you where in the flow it broke.
