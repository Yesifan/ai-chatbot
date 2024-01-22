import nextPWA from '@ducanh2912/next-pwa';

const isProd = process.env.NODE_ENV === 'production';
console.log(isProd ? '🚀 PRODUCTION MODE' : '💻 DEVELOPE MODE')

const withPWA = nextPWA({
  dest: 'public',
  register: true,
  workboxOptions: {
    skipWaiting: true,
  },
  cacheStartUrl: true,
  dynamicStartUrl: true,
});


const nextConfig = {
  reactStrictMode: true,
  experimental: {
    urlImports: ['https://cdn.skypack.dev'],
    swcPlugins: isProd ? undefined : [['@swc-jotai/react-refresh', {}]],
  }
}

export default isProd ? withPWA(nextConfig) : nextConfig;