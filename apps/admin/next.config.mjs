/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@kixihost/ui", "@kixihost/i18n", "@kixihost/auth", "@kixihost/shared"],
};

export default nextConfig;
