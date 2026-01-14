import { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import withBundleAnalyzer from '@next/bundle-analyzer';

// 1. Cấu hình cho i18n
const withNextIntl = createNextIntlPlugin();

// 2. Cấu hình cho Bundle Analyzer
// enabled: logic này kiểm tra xem khi chạy lệnh có kèm từ khóa ANALYZE=true hay không
// chạy: npx cross-env ANALYZE=true next build
const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Supabase
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/**',
      },
      // Picsum
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        pathname: '/**',
      },
      // IPFS gateway
      {
        protocol: 'https',
        hostname: 'ipfs.io',
        pathname: '/**',
      },
      // UI Avatars
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
        pathname: '/**',
      },
      // Flaticon CDN
      {
        protocol: 'https',
        hostname: 'cdn-icons-png.flaticon.com',
        pathname: '/**',
      },
      // Unsplash
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  experimental: {
    // Tự động tối ưu import cho các thư viện này
    optimizePackageImports: [
      'lucide-react',
      'date-fns',
      '@radix-ui/react-accordion',
      '@radix-ui/react-alert-dialog',
      '@radix-ui/react-avatar',
      '@radix-ui/react-checkbox',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-label',
      '@radix-ui/react-popover',
      '@radix-ui/react-progress',
      '@radix-ui/react-radio-group',
      '@radix-ui/react-scroll-area',
      '@radix-ui/react-select',
      '@radix-ui/react-separator',
      '@radix-ui/react-slot',
      '@radix-ui/react-switch',
      '@radix-ui/react-tabs',
      '@radix-ui/react-toggle',
      '@radix-ui/react-tooltip',
    ],
  },
};

// 3. Xuất file config: Lồng 2 plugin vào nhau
// bundleAnalyzer bao lấy withNextIntl, và withNextIntl bao lấy nextConfig
export default bundleAnalyzer(withNextIntl(nextConfig));