const isProd = process.env.NODE_ENV === 'production';

const withPWA = require('@ducanh2912/next-pwa')({
  dest: 'public',
  register: true,
  workboxOptions: {
    skipWaiting: true,
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

module.exports = isProd ? withPWA(nextConfig) : nextConfig;