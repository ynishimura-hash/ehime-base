import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // キャッシュバスティング: ビルドIDを毎回変更して古いキャッシュを無効化
    generateBuildId: async () => {
        return `build-${Date.now()}`;
    },
    // @ts-ignore
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    // キャッシュ制御ヘッダーを追加
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'no-cache, no-store, must-revalidate',
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
