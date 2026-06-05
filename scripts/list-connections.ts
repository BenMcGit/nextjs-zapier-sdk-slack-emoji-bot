/**
 * Lists all Zapier connections with their IDs and status.
 *
 *   pnpm zapier:connections
 */
import { getZapier } from "../lib/zapier";

async function main() {
  const zapier = getZapier();
  const { data: connections } = await zapier.listConnections();

  if (!connections?.length) {
    console.log("No connections found. Connect apps at zapier.com/app/connections.");
    return;
  }

  const rows = connections.map((conn) => ({
    app: conn.app_key ?? "unknown",
    name: conn.title ?? conn.label ?? conn.identifier ?? "—",
    id: conn.id,
    status: conn.is_expired === "1" ? "expired" : conn.is_stale === "1" ? "stale" : "active",
  }));

  const widths = {
    app: Math.max("APP".length, ...rows.map((r) => r.app.length)),
    name: Math.max("NAME".length, ...rows.map((r) => r.name.length)),
    id: Math.max("ID".length, ...rows.map((r) => r.id.length)),
    status: Math.max("STATUS".length, ...rows.map((r) => r.status.length)),
  };

  const fmt = (r: typeof rows[0]) =>
    [r.app.padEnd(widths.app), r.name.padEnd(widths.name), r.id.padEnd(widths.id), r.status].join("  ");

  const divider = "-".repeat(widths.app + widths.name + widths.id + widths.status + 6);

  console.log(fmt({ app: "APP", name: "NAME", id: "ID", status: "STATUS" }));
  console.log(divider);
  for (const row of rows) console.log(fmt(row));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
