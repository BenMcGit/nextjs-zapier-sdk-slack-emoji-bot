/**
 * Peek at a real trigger payload without consuming it.
 * Useful for understanding the payload shape before writing normalization code.
 *
 *   pnpm zapier:trigger-sample <app> <trigger-key>
 *
 * Example:
 *   pnpm zapier:trigger-sample slack new_message
 *
 * This leases one message from the matching inbox and prints its raw payload.
 * The message is NOT consumed — it remains available for normal processing.
 *
 * If no messages are queued, fire a real event in the connected app and re-run.
 */
import { getZapier } from "../lib/zapier";

const app = process.argv[2];
const triggerKey = process.argv[3];

if (!app || !triggerKey) {
  console.error("Usage: pnpm zapier:trigger-sample <app> <trigger-key>");
  console.error("Example: pnpm zapier:trigger-sample slack new_message");
  process.exit(1);
}

async function main() {
  const zapier = getZapier();

  // Find an inbox matching the app and trigger
  const inboxes = await zapier.listTriggerInboxes();
  const matching = (inboxes.data ?? []).filter(
    (i) =>
      i.subscription.app_key.toLowerCase().startsWith(app.toLowerCase()) &&
      i.subscription.action_key === triggerKey &&
      i.status === "active",
  );

  if (matching.length === 0) {
    console.error(`No active inbox found for "${app}" / "${triggerKey}".`);
    console.error(`Run "pnpm zapier:inboxes" to see available inboxes.`);
    process.exit(1);
  }

  const inbox = matching[0];
  console.log(`Using inbox: ${inbox.name ?? inbox.id}\n`);

  // Lease one message without consuming it
  const result = await zapier.leaseTriggerInboxMessages({ inbox: inbox.id, leaseLimit: 1, leaseSeconds: 10 });
  const messages = result.data.results;

  if (messages.length === 0) {
    console.log("No messages queued. Fire a real event and re-run.");
    console.log(`(Fire a real "${triggerKey}" event in ${app} and re-run)`);
    return;
  }

  const payload = messages[0].payload as Record<string, unknown>;

  console.log("── Raw payload ───────────────────────────────────────────────");
  console.log(JSON.stringify(payload, null, 2));
  console.log("\n── Top-level keys ────────────────────────────────────────────");
  for (const key of Object.keys(payload)) {
    const val = payload[key];
    const preview = typeof val === "object" && val !== null
      ? `{ ${Object.keys(val as object).join(", ")} }`
      : JSON.stringify(val);
    console.log(`  ${key.padEnd(24)} ${preview}`);
  }
  console.log("\nMessage was not consumed — it remains in the inbox for normal processing.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
