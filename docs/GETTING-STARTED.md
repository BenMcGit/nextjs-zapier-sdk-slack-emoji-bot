# Getting Started

This guide walks you through setting up the bot from a fresh clone to a working deployment.

## What you'll need

- A Zapier account
- Access to the apps you want to connect
- A platform to host the Next.js app (e.g. Vercel)

---

## Step 1: Install dependencies

```bash
pnpm install
```

---

## Step 2: Set up your environment file

Create your local env file from the example:

```bash
cp .env.example .env.local
```

You'll fill in values as you complete the steps below.

---

## Step 3: Log in to Zapier

The Zapier SDK CLI handles authentication and credential creation for you. Start by logging in:

```bash
npx zapier-sdk login
```

This opens a browser window to authenticate with your Zapier account and stores a local token. This is a one-time step per machine.

---

## Step 4: Create client credentials

Client credentials (a client ID and secret) identify your app to Zapier and are required for server/serverless deployments where the local token isn't available.

```bash
npx zapier-sdk create-client-credentials "my-bot-name"
```

Copy the `client_id` and `client_secret` from the output — you'll need them in the next step. The secret is only shown once.

---

## Step 5: Connect your apps

Go to [zapier.com/app/connections](https://zapier.com/app/connections) and connect each app you want to use as a trigger or action. Each connected account gets a unique connection ID — you'll reference these IDs when registering triggers and actions.

---

## Step 6: Fill in your environment variables

| Variable | How to get it |
|---|---|
| `ZAPIER_CREDENTIALS_CLIENT_ID` | From step 4 |
| `ZAPIER_CREDENTIALS_CLIENT_SECRET` | From step 4 |
| `ZAPIER_WEBHOOK_SECRET` | Run `pnpm generate:secret` |
| `APP_BASE_URL` | Only needed locally — on Vercel this is set automatically |

Connection IDs and any app-specific variables are added per trigger — see step 6.

> `XDG_CONFIG_HOME` is set automatically — no action needed locally or in production.

---

## Step 7: Get your connection IDs

With your credentials set in `.env.local`, run:

```bash
pnpm zapier:connections
```

This prints all connected accounts and their IDs. You'll use these when configuring each trigger in `lib/triggers.ts` and `lib/env.ts`.

If an app isn't listed, connect it at [zapier.com/app/connections](https://zapier.com/app/connections) and re-run.

---

## Step 8: Configure your triggers

See [`docs/ADDING-A-TRIGGER.md`](./ADDING-A-TRIGGER.md) for step-by-step instructions on wiring up each trigger.

---

## Step 9: Deploy

Push your changes and set the same env vars in your deployment environment (e.g. Vercel Project Settings → Environment Variables). Include `XDG_CONFIG_HOME=/tmp` — this is required in serverless environments for the Zapier SDK to write its config.

On the first request to any webhook route, the trigger inbox is created automatically and the notification URL is registered with Zapier.

To verify after the first request:

```bash
pnpm zapier:inboxes
```

The inbox should show `active`.
