# --- 1단계: 빌드 스테이지 (Builder) ---
FROM node:20-alpine AS builder

# 빌드 시 필요한 네이티브 라이브러리 설치
RUN apk add --no-cache libc6-compat
WORKDIR /app

# [최적화 1] 패키지 파일만 먼저 복사하여 캐시 활용 (매우 중요)
# 소스 코드가 바뀌어도 라이브러리가 그대로면 이 단계는 1초 만에 넘어갑니다.
COPY package*.json ./
COPY news/package*.json ./news/

# [최적화 2] @nestjs/cli 전역 설치 제거 및 npm ci 사용
# npm install보다 빌드 환경에 최적화된 npm ci를 권장합니다.
RUN npm ci --legacy-peer-deps

# [최적화 3] 소스 코드 복사 (의존성 설치 이후에 수행)
COPY . .

# [최적화 4] 빌드 실행 (메모리 제한 하향 및 npx 사용)
# 가용 메모리 5GB를 고려하여 2048MB로 제한해야 병렬 빌드 시 서버가 죽지 않습니다.
RUN cd news && \
    echo "🚀 Starting nest build for news..." && \
    NODE_OPTIONS="--max-old-space-size=2048" npx nest build

# --- 2단계: 실행 스테이지 (Runner) ---
FROM node:20-alpine
WORKDIR /app

RUN apk add --no-cache libc6-compat

# [최적화 5] 실행에 필요한 최소 파일만 복사
# 이미지 용량을 줄여 Harbor 전송 속도를 높입니다.
COPY --from=builder /app/news/dist ./dist
COPY --from=builder /app/news/node_modules ./node_modules
COPY --from=builder /app/news/package.json ./package.json

EXPOSE 3000

# NestJS 기본 빌드 결과물은 dist/main.js입니다.
CMD ["node", "dist/main"]
