# --- 1단계: 빌드 스테이지 ---
FROM node:20-alpine AS builder

# 빌드에 필요한 라이브러리 설치
RUN apk add --no-cache libc6-compat
WORKDIR /app

# 1. 의존성 설치 최적화 (캐시 활용)
# 젠킨스 빌드 컨텍스트(backend/) 기준 경로입니다.
COPY news/package*.json ./
# 글로벌 설치(-g)를 제거하고 npx를 사용하여 시간을 단축합니다.
RUN npm ci --legacy-peer-deps

# 2. 소스 코드 복사
COPY news/ .

# 3. 빌드 실행
# 메모리 제한을 2GB로 낮춰 서버 다운을 방지합니다.
RUN echo "🚀 Starting nest build for news..." && \
    NODE_OPTIONS="--max-old-space-size=2048" npx nest build

# --- 2단계: 실행 스테이지 ---
FROM node:20-alpine
WORKDIR /app

RUN apk add --no-cache libc6-compat

# 4. 결과물만 복사 (경로 단순화)
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

# 5. 실행
CMD ["node", "dist/main"]
