export const dynamic = "force-dynamic";

import { getZapier } from "@/lib/zapier";
import { env } from "@/lib/env";
import { triggers } from "@/lib/triggers";
import { ActivateButton } from "./ActivateButton";
import { DeactivateButton } from "./DeactivateButton";
import { RefreshButton } from "./RefreshButton";
import { ManageConnectionsButton } from "./ManageConnectionsButton";
import { GitHubButton } from "./GitHubButton";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";
import type { Trigger } from "@/types";

type Connection = { id: string; title: string } | null;

type TriggerStatus = {
  trigger: Trigger;
  active: boolean;
  connection: Connection;
};

async function getTriggerStatuses(): Promise<{ statuses: TriggerStatus[]; ok: boolean; error?: string }> {
  try {
    const sdk = getZapier();
    const [connectionsResult, inboxesResult] = await Promise.allSettled([
      sdk.listConnections(),
      sdk.listTriggerInboxes(),
    ]);

    const connections = connectionsResult.status === "fulfilled"
      ? (connectionsResult.value.data ?? [])
      : [];
    const inboxes = inboxesResult.status === "fulfilled"
      ? (inboxesResult.value.data ?? [])
      : [];

    const hostname = new URL(env.APP_BASE_URL).hostname
      .replace(/[^a-z0-9]+/gi, "-")
      .toLowerCase();

    const statuses: TriggerStatus[] = triggers.map((trigger) => {
      const expectedName = `${trigger.name}-${hostname}`;
      const inbox = inboxes.find((i) => i.name === expectedName);
      const conn = connections.find(
        (c) =>
          c.app_key?.toLowerCase().includes(trigger.app.toLowerCase()) &&
          (c as { status?: string }).status !== "inactive",
      );
      const connection: Connection = conn
        ? { id: conn.id, title: conn.title ?? conn.app_key ?? conn.id }
        : null;
      return { trigger, active: !!inbox, connection };
    });

    return { ok: true, statuses };
  } catch (err) {
    return { ok: false, error: String(err), statuses: [] };
  }
}

export default async function Home() {
  const { ok, error, statuses } = await getTriggerStatuses();

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-12">
      <div className="mx-auto max-w-5xl space-y-8">

        {/* App header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Automation Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">Zapier-powered triggers running on this deployment</p>
          </div>
          <div className="flex items-center gap-1">
            <ManageConnectionsButton />
            <RefreshButton />
            <GitHubButton />
          </div>
        </div>

        {!ok && (
          <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
            Could not reach Zapier SDK. Check your credentials.
            {error && <p className="mt-1 text-xs opacity-70">{error}</p>}
          </div>
        )}

        <div className={`grid gap-4 ${
          statuses.length === 1
            ? "max-w-md mx-auto"
            : statuses.length === 2
            ? "grid-cols-2 max-w-2xl mx-auto"
            : "grid-cols-3"
        }`}>
          {statuses.map(({ trigger, active, connection }) => (
            <Card
              key={trigger.name}
              className={`shadow-md ${active ? "[animation:glow-pulse_4s_ease-in-out_infinite]" : ""}`}
            >
              <CardHeader className="pt-6 px-6 pb-4">
                <h2 className="text-base font-semibold tracking-tight leading-snug">{trigger.label}</h2>
                <p className="text-sm text-muted-foreground leading-snug">{trigger.description}</p>
              </CardHeader>

              <CardContent className="px-6 pb-6 flex-1">
                {connection ? (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground shrink-0">Connection</span>
                    <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1">
                      <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                      <span className="font-medium">{connection.title}</span>
                    </div>
                  </div>
                ) : (
                  <a
                    href="https://zapier.com/app/connections"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-orange-600 hover:text-orange-700 transition-colors"
                  >
                    Connect <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </CardContent>

              {(!active && connection) || active ? (
                <CardFooter className="px-6">
                  <div className="w-full">
                    {!active && connection && <ActivateButton triggerName={trigger.name} />}
                    {active && <DeactivateButton triggerName={trigger.name} />}
                  </div>
                </CardFooter>
              ) : null}
            </Card>
          ))}
        </div>

        <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <span>Powered by</span>
          <span className="rounded bg-orange-100 px-1.5 py-0.5 font-semibold text-orange-600">Zapier</span>
        </div>

      </div>
    </main>
  );
}
