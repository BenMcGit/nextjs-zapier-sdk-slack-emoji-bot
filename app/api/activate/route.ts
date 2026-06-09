import { NextRequest, NextResponse } from "next/server";
import { triggers } from "@/lib/triggers";
import { getZapier } from "@/lib/zapier";
import { clearInboxCache } from "@/lib/inbox";
import { env } from "@/lib/env";

function findTrigger(name: string) {
  return triggers.find((t) => t.name === name);
}

function hostnameInboxName(baseName: string) {
  const hostname = new URL(env.APP_BASE_URL).hostname
    .replace(/[^a-z0-9]+/gi, "-")
    .toLowerCase();
  return `${baseName}-${hostname}`;
}

export async function POST(req: NextRequest) {
  const { name } = await req.json();
  const trigger = findTrigger(name);
  if (!trigger) {
    return NextResponse.json({ ok: false, error: `Unknown trigger: ${name}` }, { status: 400 });
  }
  try {
    await trigger.resolveInbox();
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

export async function DELETE(req: NextRequest) {
  const { name } = await req.json();
  const trigger = findTrigger(name);
  if (!trigger) {
    return NextResponse.json({ ok: false, error: `Unknown trigger: ${name}` }, { status: 400 });
  }
  try {
    const zapier = getZapier();
    const expectedName = hostnameInboxName(trigger.name);
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
