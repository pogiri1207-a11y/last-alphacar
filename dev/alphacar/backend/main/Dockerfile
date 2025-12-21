# --- 1단계: 빌드 스테이지 ---
FROM node:20-alpine AS builder

RUN apk add --no-cache libc6-compat
WORKDIR /app

# 1. 의존성 설치 최적화
# 루트 package.json과 main 서비스의 package.json을 동시에 복사합니다.
COPY package*.json ./
COPY main/package*.json ./main/

# [핵심 수정] 
# - 글로벌 @nestjs/cli 설치를 제거하여 1~2분을 단축합니다. (npx 사용)
# - npm install 대신 npm ci를 사용하면 빌드 환경에서 더 빠르고 정확합니다.
RUN npm ci --legacy-peer-deps

# 2. 소스 코드 복사
COPY main/ ./main/
COPY libs/ ./libs/ 
# (만약 공통 라이브러리가 libs 폴더 등에 있다면 함께 복사해야 빌드가 됩니다.)

# 3. 빌드 실행
# 가용 메모리가 5GB이므로, 병렬 빌드를 위해 메모리 제한을 2048로 낮춥니다.
RUN cd main && \
    echo "🚀 Starting nest build for main..." && \
    NODE_OPTIONS="--max-old-space-size=2048" npx nest build

# --- 2단계: 실행 스테이지 ---
FROM node:20-alpine
WORKDIR /app

RUN apk add --no-cache libc6-compat

# 4. 결과물 복사
# 빌드된 dist와 실행에 필요한 node_modules만 가져와 이미지 크기를 줄입니다.
COPY --from=builder /app/main/dist ./dist
COPY --from=builder /app/main/node_modules ./node_modules
COPY --from=builder /app/main/package.json ./package.json

EXPOSE 3000

# 5. 실행
CMD ["node", "dist/main"]
