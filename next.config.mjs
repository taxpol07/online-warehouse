/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Vercel build aşamasında TS hatalarını yoksayar
    ignoreBuildErrors: true,
  },
};

export default nextConfig;// Eğer burada eski ayarların varsa onları silme, bu parantezin içinde kalsın


const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development', // Geliştirme aşamasında çerezleri bozmasın diye kapalı tutuyoruz
  register: true,
  skipWaiting: true,
});

module.exports = withPWA(nextConfig);