---
name: zapier-new-action
description: Use when writing a new zapier.runAction() call. Enforces discovery of correct action keys and input fields before writing any code.
---

# Writing a New Zapier Action

This is a **rigid** skill. Follow every step in order. Do not write any code until all discovery steps are complete.

## Why this matters

Action keys and input field names are not reliably known from training data. Using wrong keys causes silent failures — `runAction` may return successfully but do nothing, or throw an error that gets swallowed if not explicitly caught.

## Steps

### 1. Find the correct action key and type

```bash
direnv exec . pnpm zapier:discover <app>
```

Look at the **Write actions** section. Note the exact key and confirm the `actionType` is `"write"` for actions that create or send something.

### 2. Find the required input fields

```bash
direnv exec . pnpm zapier:discover <app> --action <action-key>
```

### 3. Write the code

Only after confirming field names, write the `runAction` call:

```ts
await getZapier().runAction({
  app: "<app>",
  actionType: "write",
  action: "<action-key>",  // exact key from step 1
  connection: connectionId,
  inputs: {
    "<field-key>": value,  // exact keys from step 2
  },
});
```

### 4. Always wrap in try/catch

`runAction` errors are not always re-thrown by the caller. Catch explicitly and log:

```ts
try {
  await getZapier().runAction({ ... });
} catch (err) {
  // Check err.message for "expired" or "invalid" to detect connection issues
  throw err;
}
```
