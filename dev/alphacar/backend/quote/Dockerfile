# 1단계: 빌드 스테이지
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app

# 네트워크 타임아웃 방지
RUN npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retries 5

# 1. 패키지 파일 복사
COPY package*.json ./
COPY quote/package*.json ./quote/

# 2. 의존성 설치 및 Nest CLI 설치 (에러 해결 핵심)
# npx 대신 nest 명령어를 직접 쓸 수 있도록 CLI를 설치합니다.
RUN npm ci --legacy-peer-deps --prefer-offline --no-audit && \
    npm install -g @nestjs/cli

# 3. 소스 코드 복사
COPY . .

# 4. 빌드 수행 (이제 nest 명령어를 직접 사용합니다)
# cd quote 후에 다시 npm install을 하지 않아도 되도록 수정했습니다.
RUN cd quote && nest build

# 2단계: 실행 스테이지
FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache libc6-compat

# 5. 결과물 복사
COPY --from=builder /app/quote/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/quote/package.json ./package.json

EXPOSE 3000
CMD ["node", "dist/main"]
