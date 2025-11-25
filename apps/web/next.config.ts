import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  // For GitHub Pages project site, set basePath
  // Comment this out if using a custom domain
  basePath: process.env.GITHUB_PAGES === "true" ? "/ChicagoForest.net" : "",
  assetPrefix: process.env.GITHUB_PAGES === "true" ? "/ChicagoForest.net/" : "",
  trailingSlash: true,
  // Transpile workspace packages
  transpilePackages: [
    "@chicago-forest/p2p-core",
    "@chicago-forest/routing",
    "@chicago-forest/shared-types",
  ],
};

export default nextConfig;
