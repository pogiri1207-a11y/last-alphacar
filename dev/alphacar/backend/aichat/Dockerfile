# --- 1단계: 빌드 스테이지 ---
FROM node:20-alpine AS builder

# 빌드에 필요한 최소 패키지 설치
RUN apk add --no-cache libc6-compat
WORKDIR /app

# 1. 의존성 설치 (캐시 활용 핵심)
# 루트와 해당 서비스의 설정 파일을 먼저 복사하여 라이브러리 설치 시간을 단축합니다.
COPY package*.json ./
COPY community/package*.json ./community/

# @nestjs/cli 전역 설치 제거 (시간 단축) -> npx로 대체 가능
# npm install 대신 npm ci를 사용하면 더 빠르고 안정적입니다.
RUN npm ci --legacy-peer-deps

# 2. 소스 코드 복사 (의존성 설치 이후에 수행)
COPY . .

# 3. 빌드 실행
# 메모리 제한을 가용량에 맞춰 2GB(2048)로 조정 (4096은 현재 서버에서 위험함)
RUN cd community && \
    echo "🚀 Starting nest build for community..." && \
    NODE_OPTIONS="--max-old-space-size=2048" npx nest build

# --- 2단계: 실행 스테이지 ---
FROM node:20-alpine
WORKDIR /app

RUN apk add --no-cache libc6-compat

# 4. 결과물만 복사 (이미지 용량 다이어트)
# 실행에 불필요한 파일은 제외하고 dist와 node_modules만 가져옵니다.
COPY --from=builder /app/community/dist ./dist
COPY --from=builder /app/community/node_modules ./node_modules
COPY --from=builder /app/community/package.json ./package.json

EXPOSE 3000

# 5. 실행 (경로 확인: 보통 dist/main.js 또는 dist/src/main.js)
CMD ["node", "dist/main"]
