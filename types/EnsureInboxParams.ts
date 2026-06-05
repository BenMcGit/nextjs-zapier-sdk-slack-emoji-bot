import { getZapier } from "@/lib/zapier";

/**
 * Parameters for `ensureInbox`, derived directly from the Zapier SDK's
 * `ensureTriggerInbox` signature with `name` required.
 *
 * `name` is required here (optional in the SDK) because it is the stable
 * identity key used to cache and look up the resolved inbox ID.
 */
export type EnsureInboxParams = Parameters<
  ReturnType<typeof getZapier>["ensureTriggerInbox"]
>[0] & { name: string };
