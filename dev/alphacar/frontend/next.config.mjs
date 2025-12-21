/** @type {import('next').NextConfig} */
const nextConfig = {
  // 🔹 이미지 경량화를 위한 standalone 설정 (이미 잘 넣으셨습니다!)
  output: 'standalone',
  reactStrictMode: true,

  async rewrites() {
    return [
      // [AI CHAT SERVICE]
      {
        source: '/api/chat/:path*',
        destination: 'http://traefik:9090/api/chat/:path*',
      },
      // [MAIN SERVICE - 차량 상세]
      {
        source: '/api/vehicles/detail',
        destination: 'http://traefik:9090/api/vehicles/detail',
      },
      // [MAIN SERVICE - 견적 페이지용 직접 연결]
      {
        source: '/api/vehicles/makers',
        destination: 'http://main-backend:3002/api/makers',
      },
      {
        source: '/api/vehicles/models',
        destination: 'http://main-backend:3002/api/models',
      },
      {
        source: '/api/vehicles/base-trims',
        destination: 'http://main-backend:3002/api/base-trims',
      },
      {
        source: '/api/vehicles/trims',
        destination: 'http://main-backend:3002/api/trims',
      },
      // [QUOTE SERVICE & 기타 차량 정보]
      {
        source: '/api/vehicles/:path*',
        destination: 'http://traefik:9090/api/vehicles/:path*',
      },
      {
        source: '/api/estimate/:path*',
        destination: 'http://traefik:9090/api/estimate/:path*',
      },
      {
        source: '/api/history/:path*',
        destination: 'http://traefik:9090/api/history/:path*',
      },
      {
        source: '/api/quote/:path*',
        destination: 'http://traefik:9090/api/quote/:path*',
      },
      // [MAIN SERVICE - 일반 데이터 및 랭킹]
      {
        source: '/api/main/:path*',
        destination: 'http://traefik:9090/api/main/:path*',
      },
      {
        source: '/api/brands',
        destination: 'http://traefik:9090/api/brands',
      },
      {
        source: '/api/ranking',
        destination: 'http://traefik:9090/api/sales/rankings',
      },
      {
        source: '/api/sales/:path*',
        destination: 'http://traefik:9090/api/sales/:path*',
      },
      // [찜하기 및 리뷰 분석]
      {
        source: '/api/favorites/:path*',
        destination: 'http://traefik:9090/api/favorites/:path*',
      },
      {
        source: '/api/recent-views',
        destination: 'http://traefik:9090/api/recent-views',
      },
      {
        source: '/api/review-analysis',
        destination: 'http://traefik:9090/api/review-analysis',
      },
      // [OTHER SERVICES - 커뮤니티, 마이페이지, 검색]
      {
        source: '/api/community/:path*',
        destination: 'http://traefik:9090/api/community/:path*',
      },
      {
        source: '/api/mypage/:path*',
        destination: 'http://traefik:9090/api/mypage/:path*',
      },
      {
        source: '/api/auth/:path*',
        destination: 'http://traefik:9090/api/auth/:path*',
      },
      {
        source: '/api/search/:path*',
        destination: 'http://traefik:9090/api/search/:path*',
      },
    ];
  },
};

export default nextConfig;
