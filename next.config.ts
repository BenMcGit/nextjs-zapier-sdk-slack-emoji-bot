import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@zapier/zapier-sdk",
    "@zapier/zapier-sdk-cli",
    "@napi-rs/keyring",
    "cross-keychain",
  ],
};

export default nextConfig;
