---
name: zapier-test-trigger
description: Use when inspecting a real trigger payload before writing normalization code. Peeks at a queued message without consuming it.
---

# Inspecting a Trigger Payload

Before writing a payload normalization function, look at a real payload from the trigger. Do not assume field names or structure — they vary by app and are often nested in non-obvious ways.

## Steps

### 1. Fire a real event

Trigger an actual event in the connected app — e.g. submit a form, create a record, send a message. The event must match the trigger the inbox is subscribed to.

### 2. Peek at the payload

```bash
direnv exec . pnpm zapier:trigger-sample <app> <trigger-key>
```

Example:
```bash
direnv exec . pnpm zapier:trigger-sample slack new_message
```

This leases one message from the inbox and prints:
- The full raw payload as JSON
- A summary of top-level keys and their types

The message is **not consumed** — it remains in the inbox for normal processing.

### 3. Write normalization code from the actual payload

Use the printed keys to write your normalization function. Common patterns to watch for:

- Fields may be nested under a key like `object_attributes`, `data`, or the resource name
- IDs are often numeric at the top level but string-typed in nested objects
- Author/user info is usually a nested object, not a flat string

### 4. Verify round-trip

After writing normalization, trigger a real event and check the Vercel function logs to confirm the payload is being parsed correctly.
