import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development", // Geliştirme ortamında (localhost) kapalı tutuyoruz
  register: true,
  skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Vercel build aşamasında TS hatalarını yoksayar
    ignoreBuildErrors: true,
  },
};

export default withPWA(nextConfig);