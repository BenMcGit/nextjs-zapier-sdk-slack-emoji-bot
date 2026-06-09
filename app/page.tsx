export const dynamic = "force-dynamic";

import { getZapier } from "@/lib/zapier";
import { env } from "@/lib/env";
import { triggers } from "@/lib/triggers";
import { ActivateButton } from "./ActivateButton";
import { DeactivateButton } from "./DeactivateButton";
import { RefreshButton } from "./RefreshButton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ExternalLink } from "lucide-react";
import type { Trigger } from "@/types";

type SlackConnection = { id: string; title: string } | null;

type TriggerStatus = {
  trigger: Trigger;
  active: boolean;
  slackConnection: SlackConnection;
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

    const slackConnection = connections.find(
      (c) => c.app_key?.toLowerCase().includes("slack") &&
        (c as { status?: string }).status !== "inactive",
    );
    const resolvedSlack: SlackConnection = slackConnection
      ? { id: slackConnection.id, title: slackConnection.title ?? slackConnection.app_key ?? slackConnection.id }
      : null;

    const statuses: TriggerStatus[] = triggers.map((trigger) => {
      const expectedName = `${trigger.name}-${hostname}`;
      const inbox = inboxes.find((i) => i.name === expectedName);
      return { trigger, active: !!inbox, slackConnection: resolvedSlack };
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
        <div className={`grid gap-4 ${
          statuses.length === 1
            ? "max-w-md mx-auto"
            : statuses.length === 2
            ? "grid-cols-2 max-w-2xl mx-auto"
            : "grid-cols-3"
        }`}>
        {!ok && (
          <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
            Could not reach Zapier SDK. Check your credentials.
            {error && <p className="mt-1 text-xs opacity-70">{error}</p>}
          </div>
        )}

        {statuses.map(({ trigger, active, slackConnection }) => (
          <Card
            key={trigger.name}
            className={`shadow-md ${active ? "[animation:glow-pulse_4s_ease-in-out_infinite]" : ""}`}
          >
            <CardHeader className="pb-4 pt-6 px-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold tracking-tight">{trigger.label}</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">{trigger.description}</p>
                </div>
                <Badge
                  variant={active ? "default" : "secondary"}
                  className={active ? "bg-emerald-500 hover:bg-emerald-500 text-white shrink-0" : "shrink-0"}
                >
                  {active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 px-6 pb-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Connections</p>
                  <RefreshButton />
                </div>
                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="shrink-0 text-muted-foreground">Slack</span>
                  {slackConnection ? (
                    <div className="flex min-w-0 items-center gap-1.5">
                      <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                      <span className="truncate font-medium">{slackConnection.title}</span>
                    </div>
                  ) : (
                    <a
                      href="https://zapier.com/app/connections"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-xs font-medium text-orange-600 hover:text-orange-700 transition-colors"
                    >
                      Connect <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
                {slackConnection ? (
                  <a
                    href="https://zapier.com/app/connections"
                    target="_blank"
                    rel="noreferrer"
                    className="block text-center text-xs text-muted-foreground hover:text-foreground transition-colors pt-1"
                  >
                    View all connections →
                  </a>
                ) : null}
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Configuration</p>
                <div className="space-y-3 text-sm">
                  {Object.entries(trigger.inputs ?? {}).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between gap-4">
                      <span className="shrink-0 capitalize text-muted-foreground">{key}</span>
                      <span className="font-mono font-medium text-xs truncate max-w-[200px]">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {!active && slackConnection && (
                <>
                  <Separator />
                  <ActivateButton triggerName={trigger.name} />
                </>
              )}

              {active && (
                <div className="flex justify-center pt-1">
                  <DeactivateButton triggerName={trigger.name} />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        </div>

        <div className="flex items-center justify-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">Powered by</span>
            <span className="rounded bg-orange-100 px-1.5 py-0.5 text-xs font-semibold text-orange-600">
              Zapier
            </span>
          </div>
          <span className="text-zinc-300">·</span>
          <a
            href="https://github.com/zapier/sdk"
            target="_blank"
            rel="noreferrer"
            className="text-zinc-400 hover:text-zinc-700 transition-colors"
            aria-label="View on GitHub"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
          </a>
        </div>
      </div>
    </main>
  );
}
