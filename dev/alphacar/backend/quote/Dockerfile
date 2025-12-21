# --- 1단계: 빌드 스테이지 (Builder) ---
FROM node:20-alpine AS builder

# 빌드 시 필요한 필수 라이브러리 설치
RUN apk add --no-cache libc6-compat
WORKDIR /app

# [최적화 1] 패키지 설정 파일만 먼저 복사 (캐시 활용 극대화)
# 루트와 quote 폴더의 설정 파일을 먼저 복사하여 의존성 설치 단계를 캐싱합니다.
COPY package*.json ./
COPY quote/package*.json ./quote/

# [최적화 2] @nestjs/cli 전역 설치 제거 및 npm ci 사용
# 전역 설치(-g)는 매번 1분 이상 소요됩니다. npx를 사용하여 시간을 단축합니다.
RUN npm ci --legacy-peer-deps

# [최적화 3] 소스 코드 복사 (의존성 설치 이후 수행)
COPY . .

# [최적화 4] 빌드 실행 (메모리 제한 하향 및 npx 사용)
# 가용 메모리 5GB 환경에서 병렬 빌드를 위해 2048MB로 제한합니다.
RUN cd quote && \
    echo "🚀 Starting nest build for quote..." && \
    NODE_OPTIONS="--max-old-space-size=2048" npx nest build

# --- 2단계: 실행 스테이지 (Runner) ---
FROM node:20-alpine
WORKDIR /app

RUN apk add --no-cache libc6-compat

# [최적화 5] 실행에 필요한 최소 파일만 복사
# 이미지 용량을 줄여서 Harbor로 전송(Push)하는 시간을 단축합니다.
COPY --from=builder /app/quote/dist ./dist
COPY --from=builder /app/quote/node_modules ./node_modules
COPY --from=builder /app/quote/package.json ./package.json

EXPOSE 3000

# NestJS 빌드 결과물 실행
CMD ["node", "dist/main"]
