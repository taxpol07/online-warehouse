const nextConfig = {
  typescript: {
    // Vercel build aşamasında TS hatalarını yoksayar
    ignoreBuildErrors: true,
  },
  eslint: {
    // Vercel build aşamasında ESLint uyarılarını yoksayar
    ignoreDuringBuilds: true,
  }
};

export default nextConfig;