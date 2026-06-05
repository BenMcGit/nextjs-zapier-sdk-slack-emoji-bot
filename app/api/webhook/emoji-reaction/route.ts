import { NextRequest, NextResponse } from "next/server";
import { drainInbox } from "@/lib/inbox";
import { getZapier } from "@/lib/zapier";
import { env } from "@/lib/env";
import { emojiReactionTrigger } from "@/lib/triggers";
import { resolveSlackConnection } from "@/lib/connections";

function normalizePayload(payload: Record<string, unknown>) {
  const msg = (payload["message"] ?? {}) as Record<string, unknown>;
  return {
    channel: String(payload["conversation"] ?? ""),
    threadTs: String(msg["ts"] ?? ""),
  };
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const secret = env.ZAPIER_WEBHOOK_SECRET;
  if (secret && req.nextUrl.searchParams.get("token") !== secret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const inboxId = await emojiReactionTrigger.resolveInbox();

    await drainInbox(inboxId, async (msg) => {
      const { channel, threadTs } = normalizePayload(
        msg.payload as Record<string, unknown>
      );

      try {
        await getZapier().runAction({
          app: "slack",
          actionType: "write",
          action: "channel_message",
          connection: await resolveSlackConnection(),
          inputs: {
            channel,
            text: env.BOT_MESSAGE,
            thread_ts: threadTs,
          },
        });
      } catch (err) {
        console.error("[emoji-reaction] runAction failed:", err);
        throw err;
      }
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[emoji-reaction] Error:", err);
    return NextResponse.json({ ok: false, error: String(err) });
  }
}
