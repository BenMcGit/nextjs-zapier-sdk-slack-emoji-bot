/**
 * Delete a trigger inbox by name or ID.
 * Pass --dry-run to preview without deleting.
 *
 *   pnpm zapier:delete-inbox <name-or-id>
 *   pnpm zapier:delete-inbox <name-or-id> --dry-run
 */
import { getZapier } from "../lib/zapier";

const arg = process.argv[2];
const dryRun = process.argv.includes("--dry-run");

if (!arg) {
  console.error("Usage: pnpm zapier:delete-inbox <name-or-id> [--dry-run]");
  process.exit(1);
}

async function main() {
  const zapier = getZapier();

  const result = await zapier.listTriggerInboxes();
  const all = result.data ?? [];

  const matches = all.filter((i) => i.id === arg || i.name === arg);

  if (matches.length === 0) {
    console.error(`No inbox found matching: ${arg}`);
    console.log("\nAvailable inboxes:");
    for (const i of all) {
      console.log(`  ${i.id}  ${i.name ?? "(unnamed)"}  [${i.status}]`);
    }
    process.exit(1);
  }

  for (const inbox of matches) {
    console.log(`${dryRun ? "[dry-run] would delete" : "Deleting"}: ${inbox.name ?? inbox.id}  (${inbox.id})  [${inbox.status}]`);
    if (!dryRun) {
      await zapier.deleteTriggerInbox({ inbox: inbox.id });
      console.log("  ✓ deleted");
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
