/**
 * Discovery utility — list triggers, actions, connections, and input fields.
 *
 *   pnpm zapier:discover <app>
 *   pnpm zapier:discover <app> <trigger-key>              # input fields for a trigger
 *   pnpm zapier:discover <app> <trigger-key> <field-key>  # valid choices for a trigger field
 *   pnpm zapier:discover <app> --action <action-key>      # input fields for a write action
 *
 * Examples:
 *   pnpm zapier:discover slack
 *   pnpm zapier:discover slack new_message
 *   pnpm zapier:discover slack new_message channel
 *   pnpm zapier:discover slack --action channel_message
 */
import { getZapier } from "../lib/zapier";

const app = process.argv[2];
const actionFlagIndex = process.argv.indexOf("--action");
const isActionMode = actionFlagIndex !== -1;
const actionKey = isActionMode ? process.argv[actionFlagIndex + 1] : undefined;
const triggerKey = !isActionMode ? process.argv[3] : undefined;
const field = !isActionMode ? process.argv[4] : undefined;

if (!app) {
  console.error("Usage:");
  console.error("  pnpm zapier:discover <app>");
  console.error("  pnpm zapier:discover <app> <trigger-key>");
  console.error("  pnpm zapier:discover <app> <trigger-key> <field-key>");
  console.error("  pnpm zapier:discover <app> --action <action-key>");
  process.exit(1);
}

if (isActionMode && !actionKey) {
  console.error("Error: --action requires a key, e.g. --action channel_message");
  process.exit(1);
}

async function main() {
  const zapier = getZapier();
  const connections = await zapier.listConnections({ appKey: app });
  const connection = connections.data?.[0]?.id;

  // Action input fields mode
  if (isActionMode) {
    console.log(`\n── Input fields for "${app}" action "${actionKey}" ──────────────`);
    if (connection) console.log(`   (using connection: ${connection})\n`);
    let count = 0;
    for await (const f of zapier.listActionInputFields({
      app,
      actionType: "write",
      action: actionKey!,
      connection,
    }).items()) {
      if (f.type !== "input_field") continue;
      count++;
      const required = f.is_required ? " (required)" : "";
      console.log(`  ${f.key}${required}`);
      if (f.description) console.log(`      ${f.description}`);
    }
    if (count === 0) console.log("  (no input fields found)");
    console.log();
    return;
  }

  // Trigger field choices mode
  if (triggerKey && field) {
    console.log(`\n── Choices for "${app}" / "${triggerKey}" / "${field}" ──────────`);
    if (connection) console.log(`   (using connection: ${connection})\n`);
    let count = 0;
    for await (const c of zapier.listTriggerInputFieldChoices({ app, action: triggerKey, inputField: field, connection }).items()) {
      const id = c.value ?? c.key ?? "(no id)";
      console.log(`  ${String(id).padEnd(30)} ${c.label ?? ""}`);
      count++;
    }
    if (count === 0) console.log("  (no choices — field may be free-text)");
    console.log();
    return;
  }

  // Trigger input fields mode
  if (triggerKey) {
    console.log(`\n── Input fields for "${app}" trigger "${triggerKey}" ────────────`);
    if (connection) console.log(`   (using connection: ${connection})\n`);
    let count = 0;
    for await (const f of zapier.listTriggerInputFields({ app, action: triggerKey, connection }).items()) {
      if (f.type !== "input_field") continue;
      count++;
      const required = f.is_required ? " (required)" : "";
      const deps = f.depends_on?.length ? ` depends_on: [${f.depends_on.join(", ")}]` : "";
      console.log(`  ${f.key}${required}${deps}`);
      if (f.description) console.log(`      ${f.description}`);
    }
    if (count === 0) console.log("  (no input fields)");
    console.log(`\n  Run: pnpm zapier:discover ${app} ${triggerKey} <field-key>  to list choices for a field\n`);
    return;
  }

  // Default: list triggers, actions, and connections
  console.log(`\n── Triggers for "${app}" ─────────────────────────────────────`);
  let triggerCount = 0;
  for await (const t of zapier.listTriggers({ app }).items()) {
    console.log(`  ${t.key}`);
    console.log(`      ${t.title}`);
    triggerCount++;
  }
  if (triggerCount === 0) console.log("  (none found)");

  console.log(`\n── Write actions for "${app}" ────────────────────────────────`);
  let actionCount = 0;
  for await (const a of zapier.listActions({ app, actionType: "write" }).items()) {
    console.log(`  ${a.key}`);
    console.log(`      ${a.title}`);
    actionCount++;
  }
  if (actionCount === 0) console.log("  (none found)");

  console.log(`\n── Connections for "${app}" ──────────────────────────────────`);
  let connCount = 0;
  for await (const c of zapier.listConnections({ appKey: app }).items()) {
    console.log(`  ${c.id}  ${c.title ?? "(no title)"}`);
    connCount++;
  }
  if (connCount === 0) console.log("  (none — connect this app at zapier.com/app/connections)");

  console.log(`\n  Run: pnpm zapier:discover ${app} <trigger-key>  to inspect trigger input fields`);
  console.log(`  Run: pnpm zapier:discover ${app} --action <action-key>  to inspect action input fields\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
