# --- 1단계: 빌드 스테이지 ---
FROM node:20-alpine AS builder

RUN apk add --no-cache libc6-compat
WORKDIR /app

# 1. 패키지 파일 복사 (루트 및 서비스)
COPY package*.json ./
COPY aichat/package*.json ./aichat/

# 2. 의존성 설치 (루트에서 한 번만 수행)
RUN npm ci --legacy-peer-deps

# 3. 소스 코드 복사
COPY . .

# 4. 빌드 실행 (절대 경로 사용으로 127 에러 방지)
RUN cd aichat && \
    echo "🚀 Starting nest build for aichat..." && \
    NODE_OPTIONS="--max-old-space-size=2048" /app/node_modules/.bin/nest build

# --- 2단계: 실행 스테이지 ---
FROM node:20-alpine
WORKDIR /app

RUN apk add --no-cache libc6-compat

# 5. 빌드 결과물 및 의존성 복사
COPY --from=builder /app/aichat/dist ./dist
COPY --from=builder /app/aichat/node_modules ./node_modules
COPY --from=builder /app/aichat/package.json ./package.json

EXPOSE 3000
CMD ["node", "dist/main"]
