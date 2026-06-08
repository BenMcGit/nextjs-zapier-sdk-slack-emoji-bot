import { NextResponse } from "next/server";
import { emojiReactionTrigger } from "@/lib/triggers";
import { getZapier } from "@/lib/zapier";
import { clearInboxCache } from "@/lib/inbox";
import { env } from "@/lib/env";

export async function POST() {
  try {
    await emojiReactionTrigger.resolveInbox();
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = String(err);
    const isHttpsError =
      (err as Record<string, unknown>)?.code === "ZAPIER_VALIDATION_ERROR" &&
      message.toLowerCase().includes("https");
    return NextResponse.json(
      {
        ok: false,
        error: isHttpsError
          ? "Zapier requires an HTTPS URL. Deploy this app to a public URL before activating."
          : message,
      },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  try {
    const zapier = getZapier();
    const hostname = new URL(env.APP_BASE_URL).hostname
      .replace(/[^a-z0-9]+/gi, "-")
      .toLowerCase();
    const expectedName = `slack-emoji-reaction-bot-${hostname}`;
    const inboxes = await zapier.listTriggerInboxes();
    const inbox = (inboxes.data ?? []).find((i) => i.name === expectedName);
    if (!inbox) {
      return NextResponse.json({ ok: false, error: "Inbox not found" }, { status: 404 });
    }
    await zapier.deleteTriggerInbox({ inbox: inbox.id });
    clearInboxCache(expectedName);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
