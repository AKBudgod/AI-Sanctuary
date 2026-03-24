/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    images: {
        unoptimized: true,
    },
    // Suppress third-party cookie/storage warnings
    transpilePackages: ['@web3modal', 'ethers'],
    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    reactStrictMode: false,
    trailingSlash: true,
};

export default nextConfig;
