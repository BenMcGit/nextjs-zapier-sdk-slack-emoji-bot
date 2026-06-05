# nextjs-zapier-sdk-slack-emoji-bot

A Next.js template for building a Slack bot powered by the [Zapier SDK](https://www.npmjs.com/package/@zapier/zapier-sdk). Watch for an emoji reaction in any Slack channel and automatically reply in the thread — no OAuth apps, no token management, no webhook plumbing.

---

## Prerequisites

- A [Zapier account](https://zapier.com/sign-up)
- A [Vercel account](https://vercel.com/signup)
- The Zapier SDK CLI installed globally:
  ```bash
  npm install -g @zapier/zapier-sdk-cli
  ```
- Your Slack workspace connected to Zapier at [zapier.com/app/connections](https://zapier.com/app/connections)

---

## Deploy

**Before you deploy:** Make sure you've completed the prerequisites above — especially connecting Slack at [zapier.com/app/connections](https://zapier.com/app/connections). The bot auto-discovers your Slack connection on first request — no connection ID needed — but the connection must exist first.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgitlab.com%2Fben.mcadams%2Fnextjs-zapier-sdk-slack-emoji-bot&env=ZAPIER_CREDENTIALS_CLIENT_ID,ZAPIER_CREDENTIALS_CLIENT_SECRET,ZAPIER_WEBHOOK_SECRET,SLACK_CHANNEL_ID,SLACK_EMOJI,BOT_MESSAGE&envDescription=Zapier%20SDK%20credentials%2C%20webhook%20secret%2C%20and%20bot%20configuration&envLink=https%3A%2F%2Fgitlab.com%2Fben.mcadams%2Fnextjs-zapier-sdk-slack-emoji-bot%2F-%2Fblob%2Fmain%2Fdocs%2FGETTING-STARTED.md&project-name=nextjs-zapier-sdk-slack-emoji-bot&repository-name=nextjs-zapier-sdk-slack-emoji-bot)

**Required during deploy:**

| Variable | How to get it |
|---|---|
| `ZAPIER_CREDENTIALS_CLIENT_ID` | Run `zapier-sdk login` then `zapier-sdk create-client-credentials "nextjs-zapier-sdk-slack-emoji-bot"` |
| `ZAPIER_CREDENTIALS_CLIENT_SECRET` | Same command — shown once, save it |
| `ZAPIER_WEBHOOK_SECRET` | Any random string, e.g. `openssl rand -hex 32` |
| `SLACK_CHANNEL_ID` | Right-click the channel in Slack → Copy link → the ID is the last path segment |
| `SLACK_EMOJI` | Emoji name without colons, e.g. `tada` |
| `BOT_MESSAGE` | The message the bot posts in the thread |

**After deploy:**

1. Visit your app URL — the dashboard shows your Slack connection and active trigger inboxes.
2. React to any message in your configured channel with the emoji. The bot replies in that thread within a few seconds.
3. To customize the bot, clone the repo, make changes, and push — Vercel redeploys automatically.

---

## Why Zapier?

Integrating directly with third-party apps means registering OAuth apps, handling token refresh, managing webhooks, and keeping up with API changes. The Zapier SDK handles all of that:

- **Managed auth** — OAuth flows, token storage, and refresh are Zapier's problem
- **Reliable triggers** — Zapier queues events in an inbox your app drains on demand
- **One-line actions** — send a message, create a record, or post a notification with a single `zapier.runAction()` call
- **9,000+ apps** — swap any trigger or action with a config change, no new OAuth app needed

---

## How it works

```
Trigger app event
      │
      ▼
  Zapier trigger inbox
  (queues the event)
      │
      │  POST /api/webhook/<trigger>?token=...
      ▼
  This Next.js app
  (drains the inbox)
      │
      │  zapier.runAction(...)
      ▼
  Action app
```

1. Zapier watches a connected app for events via its built-in integration.
2. When an event fires, Zapier calls this app's webhook endpoint.
3. The app drains the trigger inbox and performs an action through Zapier.

The dashboard at `/` shows live connection status and active trigger inboxes.

---

## Getting started

See [docs/GETTING-STARTED.md](docs/GETTING-STARTED.md).

---

## Adding a trigger

See [docs/ADDING-A-TRIGGER.md](docs/ADDING-A-TRIGGER.md).

---

## Troubleshooting

See [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md).

---

## License

MIT
