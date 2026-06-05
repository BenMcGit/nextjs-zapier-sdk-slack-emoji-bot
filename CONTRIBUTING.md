# Contributing

Thanks for your interest in contributing. This is a Next.js template for building Slack bots with the [Zapier SDK](https://www.npmjs.com/package/@zapier/zapier-sdk) — the kind of thing people fork and make their own. Contributions that improve the template for everyone are welcome.

## What belongs here

- **Bug fixes** — something broken in the template itself (webhook handling, inbox logic, dashboard, etc.)
- **Documentation improvements** — clearer setup steps, better troubleshooting entries, corrected instructions
- **Template improvements** — better defaults, improved error handling, DX improvements that benefit all forks

If you've built something cool on top of this template, that's great — but app-specific customizations belong in your fork, not here.

## Before you open anything

- **Bug?** Open an issue. Include what you expected, what happened, your Node version, and any relevant error output.
- **Improvement idea?** Open an issue first to discuss. A quick conversation avoids wasted effort on both sides.
- **Question about setup?** Check [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) first.

## Local setup

You'll need a Zapier account with Slack connected and a set of SDK credentials before the app does anything useful. Follow [docs/GETTING-STARTED.md](docs/GETTING-STARTED.md) to get those, then:

```bash
git clone https://github.com/zapier/nextjs-zapier-sdk-slack-emoji-bot.git
cd nextjs-zapier-sdk-slack-emoji-bot
pnpm install
cp .env.example .env.local   # fill in your credentials
pnpm dev
```

The app runs at `http://localhost:3000`. Use an [ngrok](https://ngrok.com) tunnel if you need Zapier to reach your local webhook.

## Submitting a PR

1. Fork the repo and create a branch off `main`.
2. Make your change. If it touches the webhook or inbox logic, test it end-to-end with a real Zapier trigger.
3. Open a PR with a clear description of what changed and why.

Commit messages should use imperative mood and explain the *why*:

- `Fix inbox not bootstrapping on first cold start`
- `Add error boundary to dashboard connection card`
- `Clarify ngrok setup in GETTING-STARTED`

Avoid `fix stuff`, `wip`, or messages that won't make sense six months from now.

## Code of conduct

By participating, you agree to abide by the [Code of Conduct](./CODE_OF_CONDUCT.md). Report concerns to **support@zapier.com**.

## License

By contributing, you agree your contributions will be licensed under the [MIT License](./LICENSE).
