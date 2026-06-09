import { ensureInbox } from "./inbox";
import { env } from "./env";
import { resolveSlackConnection } from "./connections";
import type { TriggerConfig, Trigger } from "@/types";

// ─── Infrastructure (do not edit) ────────────────────────────────────────────

/**
 * Defines a Zapier trigger inbox and attaches runtime resolution behavior.
 *
 * Run the following discovery commands before filling in config values —
 * trigger keys, field keys, and valid field values vary by app version and
 * cannot be reliably guessed:
 *
 * ```bash
 * pnpm zapier:discover <app>                        # list triggers and connection IDs
 * pnpm zapier:discover <app> <trigger>              # list required input fields
 * pnpm zapier:discover <app> <trigger> <field>      # list valid values for a field
 * ```
 *
 * @param config - Trigger configuration. See {@link TriggerConfig} for field details.
 * @returns A {@link Trigger} with a `resolveInbox()` method ready to use in a route handler.
 */
function defineTrigger(config: TriggerConfig): Trigger {
  return {
    ...config,
    resolveInbox: async () => {
      const secret = env.ZAPIER_WEBHOOK_SECRET;
      const baseUrl = env.APP_BASE_URL;
      const notificationUrl = `${baseUrl}${config.notificationPath}${secret ? `?token=${secret}` : ""}`;
      const hostname = new URL(baseUrl).hostname
        .replace(/[^a-z0-9]+/gi, "-")
        .toLowerCase();
      const connection =
        typeof config.connection === "function"
          ? await config.connection()
          : config.connection;
      return ensureInbox({
        name: `${config.name}-${hostname}`,
        app: config.app,
        action: config.action,
        connection,
        inputs: config.inputs ?? {},
        notificationUrl,
      });
    },
  };
}

// ─── Triggers (add yours here) ───────────────────────────────────────────────

export const emojiReactionTrigger = defineTrigger({
  name: "slack-emoji-reaction-bot",
  label: "Slack Emoji Bot",
  get description() {
    return `Replies in thread when :${env.SLACK_EMOJI}: is added`;
  },
  app: "slack",
  action: "new_reaction_added_v2",
  connection: resolveSlackConnection,
  inputs: {
    get conversation() {
      return env.SLACK_CHANNEL_ID;
    },
    get emoji() {
      return env.SLACK_EMOJI;
    },
  },
  notificationPath: "/api/webhook/emoji-reaction",
});

// All triggers — add new ones here and they appear automatically on the dashboard.
export const triggers = [emojiReactionTrigger];
