/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  // basePath should be just the repo name, not /repo/demo
  basePath: process.env.NODE_ENV === "production" ? "/TradeStrategyBuilder" : "",
  assetPrefix: process.env.NODE_ENV === "production" ? "/TradeStrategyBuilder/" : "",
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
}

export default nextConfig
