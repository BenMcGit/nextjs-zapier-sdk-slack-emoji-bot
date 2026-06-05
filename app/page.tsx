export const dynamic = "force-dynamic";

import { getZapier } from "@/lib/zapier";
import { RefreshButton } from "./RefreshButton";

type Connection = {
  id: string;
  title?: string | null;
  app_key?: string;
};

type TriggerInbox = {
  id: string;
  name: string | null;
  status: string;
  notification_url: string | null;
  subscription: { app_key: string; action_key: string };
};

async function getStatus() {
  try {
    const sdk = getZapier();
    const [connectionsResult, inboxesResult] = await Promise.allSettled([
      sdk.listConnections(),
      sdk.listTriggerInboxes(),
    ]);

    const connections: Connection[] =
      connectionsResult.status === "fulfilled" ? (connectionsResult.value.data ?? []) : [];
    const inboxes: TriggerInbox[] =
      inboxesResult.status === "fulfilled" ? (inboxesResult.value.data ?? []) : [];

    return { ok: true, connections, inboxes };
  } catch (err) {
    return { ok: false, error: String(err), connections: [], inboxes: [] };
  }
}

function StatusBadge({ connected, label }: { connected: boolean; label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-3">
      <span
        className={`h-2.5 w-2.5 rounded-full ${connected ? "bg-emerald-500" : "bg-zinc-300"}`}
      />
      <span className="text-sm font-medium text-zinc-700">{label}</span>
      <span
        className={`ml-auto text-xs font-medium ${connected ? "text-emerald-600" : "text-zinc-400"}`}
      >
        {connected ? "Connected" : "Not connected"}
      </span>
    </div>
  );
}

export default async function Home() {
  const status = await getStatus();

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-16">
      <div className="mx-auto max-w-2xl space-y-10">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium text-zinc-500">
              <span>Powered by</span>
              <span className="rounded bg-orange-100 px-1.5 py-0.5 text-orange-700">Zapier</span>
            </div>
            <RefreshButton />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
            Zapier SDK Boilerplate
          </h1>
          <p className="text-zinc-500">
            Event-driven automations via the Zapier SDK. Connections to any app are managed by
            Zapier — no OAuth plumbing required.
          </p>
        </div>

        {/* How it works */}
        <div className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
            How it works
          </h2>
          <div className="space-y-1">
            {[
              { step: "1", text: "An event fires in a connected app", accent: false },
              {
                step: "Z",
                text: "Zapier detects the event and calls this app's webhook",
                accent: true,
              },
              {
                step: "3",
                text: "This app drains the inbox and performs an action via Zapier",
                accent: false,
              },
            ].map(({ step, text, accent }) => (
              <div key={step} className="flex items-center gap-3 py-1 text-sm text-zinc-600">
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    accent ? "bg-orange-100 text-orange-600" : "bg-zinc-200 text-zinc-600"
                  }`}
                >
                  {step}
                </div>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Connection status */}
        <div className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
            Zapier Connections
          </h2>
          {status.ok ? (
            status.connections.length > 0 ? (
              <div className="space-y-2">
                {status.connections.map((conn) => (
                  <StatusBadge
                    key={conn.id}
                    connected={true}
                    label={conn.title ?? conn.app_key ?? conn.id}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-zinc-400">
                No connections found. Connect apps at{" "}
                <a
                  href="https://zapier.com/app/connections"
                  className="underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  zapier.com/app/connections
                </a>
                .
              </p>
            )
          ) : (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <p>
                Could not reach Zapier SDK. Check your{" "}
                <code className="font-mono">ZAPIER_CREDENTIALS_CLIENT_ID</code> and{" "}
                <code className="font-mono">ZAPIER_CREDENTIALS_CLIENT_SECRET</code>.
              </p>
              <p className="mt-1 text-xs text-red-400">{status.error}</p>
            </div>
          )}
        </div>

        {/* Active trigger inboxes */}
        {status.ok && status.inboxes.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
              Active Trigger Inboxes{" "}
              <span className="ml-1 rounded-full bg-zinc-200 px-1.5 py-0.5 text-xs font-normal text-zinc-600">
                {status.inboxes.length}
              </span>
            </h2>
            <div className="divide-y divide-zinc-100 rounded-lg border border-zinc-200 bg-white">
              {status.inboxes.map((inbox) => (
                <div key={inbox.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-zinc-700">
                      {inbox.name ?? `${inbox.subscription.app_key} / ${inbox.subscription.action_key}`}
                    </p>
                    {inbox.notification_url && (
                      <p className="mt-0.5 truncate text-xs text-zinc-400 max-w-xs">
                        {inbox.notification_url}
                      </p>
                    )}
                  </div>
                  <span
                    className={`ml-4 shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                      inbox.status === "active"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-zinc-100 text-zinc-500"
                    }`}
                  >
                    {inbox.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
