/** @type {import(''next'').NextConfig} */
const isProd = process.env.NODE_ENV === "production";
const repo = "XRPL_Dev_Console";

export default {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  basePath: isProd ? `/${repo}` : "",
  assetPrefix: isProd ? `/${repo}/` : "",
  env: {
    NEXT_PUBLIC_BASE_PATH: isProd ? `/${repo}` : "",
  },
};
