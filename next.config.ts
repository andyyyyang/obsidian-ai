import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Native modules we DON'T want Next to bundle — keep them resolved at runtime
  serverExternalPackages: ["@node-rs/bcrypt"],
};

export default nextConfig;
