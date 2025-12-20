# --- 1단계: 빌드 스테이지 ---
FROM node:20-alpine AS builder

RUN apk add --no-cache libc6-compat
WORKDIR /app

# 1. 루트 의존성 설치
COPY package*.json ./
RUN npm install -g @nestjs/cli && \
    npm install --legacy-peer-deps

# 2. [핵심 수정] Main 서비스 의존성 설치
# main 폴더 안의 package.json을 보고 필요한 라이브러리(ioredis 등)를 설치합니다.
COPY main/package.json ./main/
RUN cd main && npm install --legacy-peer-deps

# 3. 소스 코드 복사
COPY . .

# 4. 빌드 실행
# 이제 라이브러리가 설치되어 있으므로 에러가 나지 않습니다.
RUN cd main && \
    NODE_OPTIONS="--max-old-space-size=4096" nest build

# --- 2단계: 실행 스테이지 ---
FROM node:20-alpine
WORKDIR /app

RUN apk add --no-cache libc6-compat

# 5. 결과물 복사
# main/node_modules를 가져오는 것이 중요합니다.
COPY --from=builder /app/main/dist ./dist
COPY --from=builder /app/main/node_modules ./node_modules
COPY --from=builder /app/main/package.json ./package.json

EXPOSE 3000

CMD ["node", "dist/main"]
