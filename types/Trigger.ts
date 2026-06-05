import type { TriggerConfig } from "./TriggerConfig";

/**
 * A fully configured trigger instance returned by `defineTrigger`.
 *
 * Extends `TriggerConfig` with runtime behavior. Consumers should only
 * interact with `resolveInbox` — the config fields are exposed for
 * introspection but are not meant to be called directly.
 */
export type Trigger = TriggerConfig & {
  /**
   * Resolves the Zapier trigger inbox ID for this trigger, creating the inbox
   * if it doesn't already exist. The result is cached in memory per process
   * instance, so the first cold-start request pays one extra Zapier API call
   * and all subsequent requests within the same instance use the cached value.
   */
  resolveInbox: () => Promise<string>;
};
