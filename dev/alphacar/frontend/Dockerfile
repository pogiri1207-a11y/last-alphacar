# 1. 공통 베이스
FROM node:20-alpine AS base
WORKDIR /app

# 🔹 빌드 시간을 줄이기 위해 텔레메트리 비활성화 및 필수 라이브러리 설치
ENV NEXT_TELEMETRY_DISABLED=1
RUN apk add --no-cache libc6-compat && \
    npm install -g npm@latest

# 2. 의존성 설치 스테이지
FROM base AS deps
WORKDIR /app

# 캐시 효율을 위해 패키지 파일만 먼저 복사 (9분 단축의 핵심)
COPY package.json package-lock.json ./
# 🔹 --prefer-offline을 사용하여 네트워크 지연 최소화
RUN npm ci --prefer-offline --no-audit --progress=false --legacy-peer-deps

# 3. 빌드 스테이지
FROM base AS builder
WORKDIR /app

# 이전 스테이지의 node_modules 재사용
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 🔹 환경 변수 설정 (에러 방지 및 메모리 제한)
ENV PATH /app/node_modules/.bin:$PATH
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS="--max-old-space-size=2048"

# 🔹 빌드 실행
RUN npm run build

# 4. 실행 스테이지 (최종 이미지 - 매우 가벼움)
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 보안 유저 생성
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# 🔹 Standalone 결과물만 복사 (Push 시간을 수 분에서 수 초로 단축)
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000

# 실행
CMD ["node", "server.js"]
