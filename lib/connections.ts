import { getZapier } from "./zapier";

let cachedSlackConnectionId: string | undefined;

export async function resolveSlackConnection(): Promise<string> {
  if (cachedSlackConnectionId) return cachedSlackConnectionId;
  const result = await getZapier().listConnections();
  const conn = (result.data ?? []).find(
    (c) => c.app_key?.toLowerCase().includes("slack") && (c as { status?: string }).status !== "inactive",
  );
  if (!conn) {
    throw new Error(
      "No active Slack connection found. Connect Slack at https://zapier.com/app/connections and redeploy.",
    );
  }
  cachedSlackConnectionId = conn.id;
  return conn.id;
}
