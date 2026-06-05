import { createZapierSdk } from "@zapier/zapier-sdk/experimental";
import { env } from "./env";

let _instance: ReturnType<typeof createZapierSdk> | undefined;

/**
 * Returns the shared Zapier SDK instance, creating it on first call.
 *
 * Initialized lazily so that `ZAPIER_CREDENTIALS_CLIENT_ID` and
 * `ZAPIER_CREDENTIALS_CLIENT_SECRET` are read at request time rather than at
 * module load time — Next.js evaluates modules during static analysis before
 * env vars are available, so calling `createZapierSdk` at the top level would
 * always fail in production builds.
 *
 * @returns The singleton Zapier SDK instance.
 */
export function getZapier() {
  if (!_instance) {
    // The Zapier SDK CLI writes config to ~/.config/zapier-sdk-cli-nodejs, which
    // doesn't exist in serverless environments. Redirect to /tmp, which is always writable.
    if (!process.env.XDG_CONFIG_HOME) {
      process.env.XDG_CONFIG_HOME = "/tmp";
    }
    _instance = createZapierSdk({
      credentials: {
        clientId: env.ZAPIER_CREDENTIALS_CLIENT_ID,
        clientSecret: env.ZAPIER_CREDENTIALS_CLIENT_SECRET,
      },
    });
  }
  return _instance;
}
