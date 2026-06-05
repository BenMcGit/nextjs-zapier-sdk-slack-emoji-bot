---
name: zapier-debug
description: Use when a Zapier trigger inbox shows initialization_failure, messages aren't being processed, or actions are silently failing.
---

# Debugging Zapier SDK Issues

## Inbox status check

Always start here:

```bash
direnv exec . pnpm zapier:inboxes
```

| Status | Meaning |
|--------|---------|
| `active` | Working correctly |
| `initialization_failure` | Zapier failed to set up the trigger — see below |
| `deleting` | Being removed, will disappear shortly |
| `paused` | Manually paused |

## Fixing `initialization_failure`

1. **Wrong input field value** — run `pnpm zapier:discover <app> <trigger> <field>` to get valid values. Field values are often numeric IDs, not human-readable strings.
2. **Wrong input field key** — run `pnpm zapier:discover <app> <trigger>` to see actual field keys. Do not assume keys from the field label.
3. **Missing connection** — the inbox must be created with a `connection` parameter. Check that `ensureTriggerInbox` includes `connection: <id>`.
4. **Insufficient permissions** — the connected account must have the access level required by the app to register webhooks.

After fixing, delete the inbox — it will be recreated automatically on the next request to the route:

```bash
direnv exec . pnpm zapier:delete-inbox <name-or-id>
```

## Messages not being processed

Check if events are arriving in the inbox without being consumed:

```bash
direnv exec . pnpm zapier:inboxes
```

Then use `pnpm zapier:trigger-sample <app> <trigger>` to peek at queued messages without consuming them.

- **No messages** — the trigger isn't firing. Check the inbox is `active` and Zapier has the correct notification URL.
- **Messages present** — the inbox has events but the webhook isn't draining them. Check Vercel function logs for errors.

## Actions silently failing

Errors inside `drainInbox` callbacks are swallowed by the SDK (`continueOnError: true`). Check Vercel function logs for `[webhook] Error:` or `[webhook] Failed to send` lines.

Common action failures:
- **"expired/invalid"** — the Zapier connection needs to be reconnected at zapier.com/app/connections. Re-run `pnpm zapier:connections` after reconnecting to get the new connection ID and update the relevant env var.
- **Field name mismatch** — verify input field keys with `listActionInputFields` (see `zapier-new-action` skill).

## Vercel-specific issues

- **`ENOENT: mkdir ~/.config/zapier-sdk-cli-nodejs`** — `XDG_CONFIG_HOME=/tmp` is not set. Add it to Vercel environment variables.
- **Function returns 200 but nothing happens** — the webhook route catches all errors and returns 200 to prevent Zapier retries. Check the function logs for `[webhook] Error:` or `[webhook] Failed to send` lines.
