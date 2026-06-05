/**
 * Configuration for a single Zapier trigger inbox.
 *
 * Pass this to `defineTrigger` in `lib/triggers.ts`. Required fields are read
 * at module load time — if they are not set, the build will fail. This is
 * intentional: required config should be present before the app starts, not
 * discovered at runtime.
 */
export type TriggerConfig = {
  /**
   * Unique inbox name used as the stable identity key across deployments.
   * `ensureInbox` always resolves the same physical inbox for the same name —
   * changing this creates a new inbox and abandons the old one.
   */
  name: string;

  /**
   * Zapier app key, e.g. `"slack"` or `"google_sheets"`.
   * Discover valid values with `pnpm zapier:discover`.
   */
  app: string;

  /**
   * Trigger key within the app, e.g. `"new_message"` or `"new_row"`.
   * Discover valid values with `pnpm zapier:discover <app>`.
   */
  action: string;

  /**
   * Zapier connection ID for this app, or an async function that resolves one.
   * Use a function to auto-discover the connection at request time (e.g. find
   * the first active Slack connection) rather than hardcoding an ID.
   */
  connection: string | (() => Promise<string>);

  /**
   * Trigger-specific input fields, if any.
   * Field keys and valid values vary by app version —
   * discover them with `pnpm zapier:discover <app> <trigger> <field>`.
   */
  inputs?: Record<string, string>;

  /**
   * URL path Zapier calls when events are queued, e.g. `"/api/webhook/my-trigger"`.
   * Combined with `APP_BASE_URL` at runtime to form the full notification URL.
   */
  notificationPath: string;
};
