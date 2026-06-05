---
name: zapier-test-action
description: Use when verifying a Zapier action works before wiring it into a webhook handler. Tests the action directly without needing a trigger or inbox.
---

# Testing a Zapier Action

Before writing a webhook handler that calls `runAction`, verify the action works and returns the expected shape.

## Steps

### 1. Discover the required input fields

```bash
direnv exec . pnpm zapier:discover <app> --action <action-key>
```

Note every required field and its exact key name.

### 2. Fire the action directly

```bash
direnv exec . pnpm zapier:run-action <app> <action-key> '<json-inputs>'
```

Example:
```bash
direnv exec . pnpm zapier:run-action slack channel_message '{"channel":"C123","text":"hello"}'
```

The script uses the first available connection for the app. If multiple connections exist, it picks the first — make sure the right account is connected.

### 3. Check the result

On success, the full response is printed as JSON. Inspect it to understand what fields are returned — these may be useful as inputs to subsequent actions.

On failure, the error message will indicate the cause:
- `"expired/invalid"` — reconnect the account at zapier.com/app/connections
- `"required field missing"` — add the missing field to your inputs
- `"unknown action"` — verify the action key with `pnpm zapier:discover <app>`

### 4. Wire it into code

Only after a successful direct test, write the `runAction` call in your handler. Always wrap in try/catch — errors inside `drainInbox` callbacks are swallowed by the SDK otherwise.
