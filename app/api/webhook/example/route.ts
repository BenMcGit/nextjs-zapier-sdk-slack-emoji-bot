import { NextRequest, NextResponse } from "next/server";
import { drainInbox } from "@/lib/inbox";
import { getZapier } from "@/lib/zapier";
import { env } from "@/lib/env";
// import { myTrigger } from "@/lib/triggers";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const secret = env.ZAPIER_WEBHOOK_SECRET;
  if (secret && req.nextUrl.searchParams.get("token") !== secret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    // TODO: Replace with your trigger from lib/triggers.ts
    // const inboxId = await myTrigger.resolveInbox();

    // TODO: Drain the inbox and handle each message
    // await drainInbox(inboxId, async (msg) => {
    //   const payload = msg.payload as Record<string, unknown>;
    //   // Normalize the payload, build your output, then call runAction:
    //   await getZapier().runAction({
    //     app: "<action-app>",
    //     actionType: "write",
    //     action: "<action-key>",
    //     connection: env.ZAPIER_MY_ACTION_CONNECTION_ID,
    //     inputs: { /* ... */ },
    //   });
    // });

    return NextResponse.json({ ok: true });
  } catch (err) {
    // Return 200 so Zapier doesn't retry the notification_url call.
    // Un-acked inbox messages remain available for the next notification.
    console.error("[webhook] Error:", err);
    return NextResponse.json({ ok: false, error: String(err) });
  }
}
