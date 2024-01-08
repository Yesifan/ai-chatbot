import nextPWA from '@ducanh2912/next-pwa';

const isProd = process.env.NODE_ENV === 'production';

const withPWA = nextPWA({
  dest: 'public',
  register: true,
  workboxOptions: {
    skipWaiting: true,
  },
  cacheStartUrl: true,
  // dynamicStartUrl: true,
});


const nextConfig = {
  reactStrictMode: true,
}

export default isProd ? withPWA(nextConfig) : nextConfig;