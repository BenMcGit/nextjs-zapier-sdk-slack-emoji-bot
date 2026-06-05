# Adding a New Trigger

Follow these steps in order. Don't skip the discovery steps — trigger keys, field names, and valid values vary by app version and can't be guessed reliably.

## Step 1: Discover the trigger

```bash
# List all available triggers for the app and find the trigger key
pnpm zapier:discover <app>

# List required input fields for the trigger
pnpm zapier:discover <app> <trigger>

# List valid values for a specific input field
pnpm zapier:discover <app> <trigger> <field>
```

Note the exact trigger key, all required input field keys, and a valid value for each field. You'll need these in step 4.

## Step 2: Get your connection ID

```bash
pnpm zapier:connections
```

This prints the connection ID for each connected app. If your app isn't listed, connect it at [zapier.com/app/connections](https://zapier.com/app/connections) and re-run.

## Step 3: Add env vars

In **`lib/env.ts`**, add a getter for the connection ID in the required section:

```ts
get ZAPIER_MY_APP_CONNECTION_ID() { return requireEnv("ZAPIER_MY_APP_CONNECTION_ID"); },
```

In **`.env.example`**, document it:

```
# Zapier connection ID for My App (printed by: pnpm zapier:connections)
ZAPIER_MY_APP_CONNECTION_ID=
```

In **`.env.local`**, set the value from step 2.

## Step 4: Register the trigger

In **`lib/triggers.ts`**, add a `defineTrigger` call under the "Triggers" section:

```ts
export const myAppEvent = defineTrigger({
  name: "my-bot-my-app-event",        // unique name — changing this creates a new inbox
  app: "<app>",                        // from step 1
  action: "<trigger>",                 // from step 1
  connection: env.ZAPIER_MY_APP_CONNECTION_ID,
  inputs: { fieldKey: "value" },       // from step 1, omit if none required
  notificationPath: "/api/webhook/my-app-event",
});
```

## Step 5: Create the route

Create **`app/api/webhook/my-app-event/route.ts`**. Use the existing route as a reference — the structure is always the same:

1. Validate the webhook token
2. Call `trigger.resolveInbox()` to get the inbox ID
3. Call `drainInbox()` and handle each message:
   - Normalize the raw payload into a typed object (`normalizeTriggerPayload`)
   - Build any outgoing message or data payload
   - Call `getZapier().runAction(...)` to perform the action

On the first request to the route, the Zapier inbox is created automatically and the notification URL is registered. Verify it came up correctly with:

```bash
pnpm zapier:inboxes
```
