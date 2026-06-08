// Next.js calls this file's `register()` function once on server startup.
// The inbox is now activated explicitly via the dashboard Activate button,
// so we no longer auto-bootstrap here — doing so would recreate the inbox
// immediately after a user deactivates it from the UI.
export async function register() {}
