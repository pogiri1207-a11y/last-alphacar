# --- 1단계: 빌드 스테이지 ---
FROM node:20-alpine AS builder

RUN apk add --no-cache libc6-compat
WORKDIR /app

# 1. 패키지 파일 복사 (캐시 활용)
COPY package*.json ./
COPY aichat/package*.json ./aichat/

# 2. 의존성 설치 (npm ci가 더 빠르고 정확합니다)
RUN npm ci --legacy-peer-deps

# 3. 소스 코드 복사
COPY . .

# 4. 빌드 실행 (경로 수정 및 실행 파일 명시)
# npx 대신 실제 설치된 경로를 직접 지정하여 에러를 방지합니다.
RUN cd aichat && \
    echo "🚀 Starting nest build for aichat..." && \
    NODE_OPTIONS="--max-old-space-size=2048" ../node_modules/.bin/nest build

# --- 2단계: 실행 스테이지 ---
FROM node:20-alpine
WORKDIR /app

RUN apk add --no-cache libc6-compat

# 5. 결과물 복사 (aichat 경로 확인)
COPY --from=builder /app/aichat/dist ./dist
COPY --from=builder /app/aichat/node_modules ./node_modules
COPY --from=builder /app/aichat/package.json ./package.json

EXPOSE 3000
CMD ["node", "dist/main"]
