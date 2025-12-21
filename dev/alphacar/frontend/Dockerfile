# 1. 공통 베이스: 보안 및 도구 설정
FROM node:20-alpine AS base
WORKDIR /app

# 🔹 npm 최신 업데이트 및 빌드에 필요한 libc6-compat 설치 (Alpine 필수)
RUN apk add --no-cache libc6-compat && \
    npm install -g npm@latest

# 2. 의존성 설치 스테이지
FROM base AS deps
WORKDIR /app

# 캐시 효율을 위해 패키지 파일만 먼저 복사
COPY package.json package-lock.json ./
# 🔹 의존성 설치 (심볼릭 링크 에러 방지를 위해 --legacy-peer-deps 추가 가능)
RUN npm ci

# 3. 빌드 스테이지
FROM base AS builder
WORKDIR /app

# 이전 스테이지에서 설치된 node_modules 가져오기
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 🔹 명령어 인식 에러 방지를 위한 PATH 설정
ENV PATH /app/node_modules/.bin:$PATH

# 🔹 5GB 메모리 보호를 위해 빌드 시 메모리 제한 할당
ENV NODE_OPTIONS="--max-old-space-size=2048"
RUN npm run build

# 4. 실행 스테이지 (최종 이미지 경량화)
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
# 🔹 보안을 위한 전용 유저 생성
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Standalone 빌드 결과물만 복사 (이미지 용량이 획기적으로 줄어듭니다)
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000

# Standalone 모드에서는 node server.js로 실행합니다.
CMD ["node", "server.js"]
