# Troubleshooting

## Dashboard shows "Could not reach Zapier SDK"

The env vars aren't set. On Vercel, add them under **Project Settings → Environment Variables** and redeploy. Locally, make sure `.env.local` exists with all required values — copy from `.env.example` to start.

## `pnpm zapier-sdk` command not found

The CLI ships as a dev dependency. Run `pnpm install` first, then invoke it as `pnpm zapier-sdk <command>` rather than a global call.

## Trigger inbox shows `initialization_failure`

Zapier failed to register a webhook. Common causes:

- **Wrong input field value** — field values are often numeric IDs, not human-readable strings. Run `pnpm zapier:discover <app> <trigger> <field>` to list valid values for your connection.
- **Wrong input field key** — run `pnpm zapier:discover <app> <trigger>` to see actual field keys. Do not assume keys from the field label.
- **Insufficient permissions** — the connected account must have the access level required by the app to register webhooks.

After fixing, delete the inbox — it will be recreated automatically on the next request:

```bash
pnpm zapier:delete-inbox <name-or-id>
```

## Deleting a stale or duplicate trigger inbox

```bash
# Preview without deleting
pnpm zapier:delete-inbox <name-or-id> --dry-run

# Delete
pnpm zapier:delete-inbox <name-or-id>
```

Run `pnpm zapier:inboxes` to list all inboxes with their current status.

## Webhook fires but no action is performed

Check Vercel function logs for the `/api/webhook/<your-trigger>` route. Common causes:

- **Connection expired** — the logs will show an `expired` or `invalid` error. Reconnect the account at [zapier.com/app/connections](https://zapier.com/app/connections), then re-run `pnpm zapier:connections` to get the new connection ID and update the relevant env var.
- **Token mismatch** — `ZAPIER_WEBHOOK_SECRET` must match the `?token=` value in your notification URL.

## Testing the flow locally

Peek at queued messages without consuming them:

```bash
pnpm zapier:trigger-sample <app> <trigger>
```

To test the full flow, trigger a real event and watch Vercel function logs for the route handling it.

## Trigger key or action key errors

Keys vary by app version. Use the discover script to find the correct values:

```bash
pnpm zapier:discover <app>                        # list all triggers and actions
pnpm zapier:discover <app> <trigger>              # list input fields for a trigger
pnpm zapier:discover <app> <trigger> <field>      # list valid choices for a field
```
