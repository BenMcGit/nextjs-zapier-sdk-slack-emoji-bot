function requireEnv(key: string): string {
  const v = process.env[key];
  if (!v) throw new Error(`${key} is not set`);
  return v;
}

/**
 * Typed, centralized access to environment variables.
 *
 * Required vars throw at the call site if missing. Optional vars return
 * `string | undefined`. Getters ensure values are read at request time,
 * not at module load time (Next.js evaluates modules during static analysis
 * before env vars are available).
 *
 * Add a getter here for each connection ID or app-specific var your
 * triggers and actions need.
 */
export const env = {
  // --- Zapier SDK credentials ---

  /** OAuth client ID. Create a client at https://developer.zapier.com */
  get ZAPIER_CREDENTIALS_CLIENT_ID() { return requireEnv("ZAPIER_CREDENTIALS_CLIENT_ID"); },

  /** OAuth client secret. Create a client at https://developer.zapier.com */
  get ZAPIER_CREDENTIALS_CLIENT_SECRET() { return requireEnv("ZAPIER_CREDENTIALS_CLIENT_SECRET"); },

  // --- App ---

  /**
   * Public base URL for Zapier notification callbacks.
   * Prefers Vercel's stable production URL env vars (auto-injected, no setup needed).
   * Falls back to APP_BASE_URL for local dev.
   */
  get APP_BASE_URL(): string {
    const vercelProd = process.env.VERCEL_PROJECT_PRODUCTION_URL;
    if (vercelProd) return `https://${vercelProd}`;
    const vercelUrl = process.env.VERCEL_URL;
    if (vercelUrl) return `https://${vercelUrl}`;
    return requireEnv("APP_BASE_URL");
  },

  /** Shared secret appended to webhook URLs as `?token=...`. Optional but recommended. */
  get ZAPIER_WEBHOOK_SECRET() { return process.env.ZAPIER_WEBHOOK_SECRET; },

  // --- Bot configuration ---

  /** Slack emoji name (without colons) that triggers the bot, e.g. `"tada"`. */
  get SLACK_EMOJI() { return requireEnv("SLACK_EMOJI"); },

  /** Slack channel ID to watch for the reaction, e.g. `"C0B3HCMMNJH"`. */
  get SLACK_CHANNEL_ID() { return requireEnv("SLACK_CHANNEL_ID"); },

  /** Message the bot posts in the thread when the emoji reaction is detected. */
  get BOT_MESSAGE() { return requireEnv("BOT_MESSAGE"); },
} as const;
