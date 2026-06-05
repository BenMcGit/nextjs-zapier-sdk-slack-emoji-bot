---
name: zapier-new-trigger
description: Use when creating a new Zapier trigger inbox. Enforces discovery of correct keys and field values before writing any code.
---

# Creating a New Zapier Trigger Inbox

This is a **rigid** skill. Follow every step in order. Do not write any code until all discovery steps are complete.

## Why this matters

Trigger keys, input field keys, and valid field values are not documented in a way that can be reliably recalled from training data. They vary by app version. Guessing causes `initialization_failure` or silent misconfiguration that is hard to debug.

## Steps

### 1. Find the correct trigger key

```bash
direnv exec . pnpm zapier:discover <app>
```

Look at the **Triggers** section. Note the exact key (e.g. `new_message`, not `message`).

### 2. Find the required input fields

```bash
direnv exec . pnpm zapier:discover <app> <trigger-key>
```

Note every field marked `(required)` and the exact key name. Do not assume field names — they often differ from what the label implies.

### 3. Find valid values for each input field

For each input field that takes a scoped value (project, channel, board, etc.):

```bash
direnv exec . pnpm zapier:discover <app> <trigger-key> <field-key>
```

Use the numeric/ID value from the output, not the label. Labels are for display; values are what the API accepts.

### 4. Find the connection ID

The connections section of step 1 lists available connections and their IDs. Use the ID, not the display name.

### 5. Write the code

Only after completing steps 1–4, add a `defineTrigger` call to **`lib/triggers.ts`** under the "Triggers" section:

```ts
export const myTrigger = defineTrigger({
  name: "my-bot-my-trigger",           // unique — changing this creates a new inbox
  app: "<app>",                         // from step 1
  action: "<trigger-key>",              // from step 1
  connection: env.ZAPIER_MY_APP_CONNECTION_ID,
  inputs: { "<field-key>": "<value>" }, // from steps 2–3, omit if none required
  notificationPath: "/api/webhook/my-trigger",
});
```

Then add `ZAPIER_MY_APP_CONNECTION_ID` to `lib/env.ts` and `.env.example`.

The inbox is created automatically on the first request to the route — no manual setup step needed.

### 6. Verify

After the first request fires, run:

```bash
direnv exec . pnpm zapier:inboxes
```

The inbox must show `active`. If it shows `initialization_failure`, return to step 2 and re-verify the input field keys and values.
