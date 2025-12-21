# ---------------------------------------------------
# 1. 빌드 단계 (Builder)
# ---------------------------------------------------
FROM node:20-alpine AS builder

# 작업 디렉터리를 루트(/app)로 설정
WORKDIR /app

# 필수 패키지 설치
RUN apk add --no-cache libc6-compat

# [최적화 1] 패키지 파일 먼저 복사 (캐시 효율 극대화)
COPY package.json package-lock.json ./
COPY mypage/package*.json ./mypage/

# [최적화 2] 글로벌 Nest CLI 설치 제거 (약 2분 단축)
# npm install 대신 npm ci를 사용하면 빌드 속도가 훨씬 빠릅니다.
RUN npm ci --legacy-peer-deps

# [최적화 3] 소스 코드 및 필요한 스키마만 복사
COPY . .

# [최적화 4] 빌드 실행 (npx 사용 및 메모리 제한)
# 5GB 메모리를 고려하여 2048MB로 제한합니다.
RUN cd mypage && \
    echo "🚀 Starting nest build for mypage..." && \
    NODE_OPTIONS="--max-old-space-size=2048" npx nest build

# ---------------------------------------------------
# 2. 실행 단계 (Runner)
# ---------------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3006

# 2-1. 의존성 및 빌드 결과물 복사
# 빌드 스테이지에서 생성된 필요한 파일만 가져와 이미지 크기를 최소화합니다.
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/mypage/node_modules ./mypage/node_modules
COPY --from=builder /app/mypage/dist ./dist
COPY --from=builder /app/mypage/package.json ./package.json

EXPOSE 3006

# 실행 경로를 dist 내부의 main으로 설정
CMD ["node", "dist/main"]
