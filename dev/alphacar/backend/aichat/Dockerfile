# --- 1단계: 빌드 스테이지 ---
FROM node:20-alpine AS builder

RUN apk add --no-cache libc6-compat
WORKDIR /app

# 1. 패키지 파일 복사
COPY package*.json ./
COPY aichat/package*.json ./aichat/

# 2. 의존성 설치 (루트에서 실행)
RUN npm ci --legacy-peer-deps

# 3. 소스 코드 복사
COPY . .

# 4. [핵심 수정] 절대 경로로 nest 실행
# npx가 루트의 node_modules를 찾지 못할 때를 대비해 직접 경로를 지정합니다.
RUN cd aichat && \
    echo "🚀 Starting nest build for aichat..." && \
    NODE_OPTIONS="--max-old-space-size=2048" /app/node_modules/.bin/nest build

# --- 2단계: 실행 스테이지 ---
FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache libc6-compat

COPY --from=builder /app/aichat/dist ./dist
COPY --from=builder /app/aichat/node_modules ./node_modules
COPY --from=builder /app/aichat/package.json ./package.json

EXPOSE 3000
CMD ["node", "dist/main"]
