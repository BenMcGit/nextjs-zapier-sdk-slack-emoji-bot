/**
 * Fire any Zapier write action directly from the CLI.
 * Useful for verifying action keys and input field names before writing integration code.
 *
 *   pnpm zapier:run-action <app> <action-key> '<json-inputs>'
 *
 * Examples:
 *   pnpm zapier:run-action slack channel_message '{"channel":"C123","text":"hello"}'
 *   pnpm zapier:run-action slack direct_message '{"user":"U123","text":"test"}'
 *
 * Tip: run `pnpm zapier:discover <app> --action <action-key>` first to see required fields.
 */
import { getZapier } from "../lib/zapier";

const app = process.argv[2];
const actionKey = process.argv[3];
const inputsArg = process.argv[4];

if (!app || !actionKey) {
  console.error("Usage: pnpm zapier:run-action <app> <action-key> '<json-inputs>'");
  console.error("Example: pnpm zapier:run-action slack channel_message '{\"channel\":\"C123\",\"text\":\"hello\"}'");
  process.exit(1);
}

async function main() {
  const zapier = getZapier();

  let inputs: Record<string, unknown> = {};
  if (inputsArg) {
    try {
      inputs = JSON.parse(inputsArg);
    } catch {
      console.error("Error: inputs must be valid JSON, e.g. '{\"channel\":\"C123\",\"text\":\"hello\"}'");
      process.exit(1);
    }
  }

  const connections = await zapier.listConnections({ appKey: app });
  const connection = connections.data?.[0];
  if (!connection) {
    console.error(`No connection found for "${app}". Connect it at zapier.com/app/connections.`);
    process.exit(1);
  }

  console.log(`Running "${actionKey}" on "${app}" (connection: ${connection.title ?? connection.id})...\n`);

  try {
    const result = await zapier.runAction({
      app,
      actionType: "write",
      action: actionKey,
      connection: connection.id,
      inputs,
    });
    console.log("Success. Result:");
    console.log(JSON.stringify(result, null, 2));
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Action failed:", msg);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
