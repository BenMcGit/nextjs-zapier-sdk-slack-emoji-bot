// Next.js calls this file's `register()` function once on server startup —
// on Vercel that means the first cold start after each deployment.
//
// We use it to bootstrap the Zapier trigger inbox so the bot is ready to
// receive events without requiring any manual setup step after deploy.
// Without this, the inbox wouldn't exist until Zapier tried to call the
// webhook URL — but Zapier doesn't know the URL until the inbox exists,
// creating a catch-22. Initializing here breaks that cycle.

export async function register() {
  // The Edge runtime (used by Next.js middleware) also calls register(), but
  // the Zapier SDK requires Node.js APIs and can't run there. Skip it.
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  // Dynamic import so the Zapier SDK is only loaded in the Node.js runtime.
  const { emojiReactionTrigger } = await import("./lib/triggers");

  // resolveInbox() calls ensureTriggerInbox() on Zapier's API, which creates
  // the subscription (telling Zapier to watch for emoji reactions) and
  // registers the notification URL (telling Zapier where to POST when events
  // are queued). It's idempotent — safe to call on every cold start.
  await emojiReactionTrigger.resolveInbox();
}
