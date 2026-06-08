import { getZapier } from "./zapier";
import type { LeasedTriggerMessageItem } from "@zapier/zapier-sdk";
import type { EnsureInboxParams } from "@/types";

const inboxIdCache = new Map<string, string>();

/**
 * Resolves a Zapier trigger inbox ID by name, creating the inbox if it doesn't
 * exist. The inbox `name` is the stable identity key — the same name always
 * resolves to the same physical inbox across deployments.
 *
 * Results are cached in memory per process instance so that only the first
 * request on a cold start pays the Zapier API round-trip. If the inbox already
 * exists but with a different notification URL, it is updated in place.
 *
 * @param params - See {@link EnsureInboxParams} for field details.
 * @returns The resolved inbox ID.
 */
export async function ensureInbox(params: EnsureInboxParams): Promise<string> {
  const cached = inboxIdCache.get(params.name);
  if (cached) { return cached; }

  const zapier = getZapier();
  let inboxId: string;
  try {
    const inbox = await zapier.ensureTriggerInbox(params);
    inboxId = inbox.data.id;
  } catch (err: unknown) {
    const code = (err as Record<string, unknown>)?.code;
    if (code !== "ZAPIER_CONFLICT_ERROR") { throw err; }
    const inboxes = await zapier.listTriggerInboxes({ name: params.name });
    const existing = inboxes.data?.[0];
    if (!existing) { throw new Error(`Conflict reported but inbox "${params.name}" not found`); }
    inboxId = existing.id;
    if (params.notificationUrl) {
      await zapier.updateTriggerInbox({ inbox: inboxId, notificationUrl: params.notificationUrl });
    }
  }

  inboxIdCache.set(params.name, inboxId);
  return inboxId;
}

export function clearInboxCache(name: string) {
  inboxIdCache.delete(name);
}

/**
 * Drains all queued messages from a Zapier trigger inbox, invoking the
 * callback for each one. Messages are acknowledged on success and released
 * back to the queue on error so they can be retried on the next notification.
 *
 * @param inboxId - The inbox ID returned by {@link ensureInbox}.
 * @param process - Async callback invoked for each queued message.
 */
export async function drainInbox(
  inboxId: string,
  process: (msg: LeasedTriggerMessageItem) => Promise<void>,
): Promise<void> {
  await getZapier().drainTriggerInbox({
    inbox: inboxId,
    onMessage: process,
    releaseOnError: true,
    continueOnError: true,
  });
}
