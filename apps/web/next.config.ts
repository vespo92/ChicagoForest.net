import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  ...(isGitHubPages && { output: "export" as const }),
  images: {
    unoptimized: isGitHubPages,
  },
  ...(isGitHubPages && {
    basePath: "/ChicagoForest.net",
    assetPrefix: "/ChicagoForest.net/",
  }),
  trailingSlash: true,
  transpilePackages: [
    "@chicago-forest/p2p-core",
    "@chicago-forest/routing",
    "@chicago-forest/shared-types",
  ],
};

export default nextConfig;
