import { NextResponse } from "next/server";
import { emojiReactionTrigger } from "@/lib/triggers";

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
