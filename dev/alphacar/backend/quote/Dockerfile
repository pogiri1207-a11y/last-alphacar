# 1단계: 빌드 스테이지
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app

# 네트워크 안정성 설정
RUN npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retries 5

# 1. 패키지 파일들 먼저 복사 (캐시 활용)
COPY package*.json ./
COPY quote/package*.json ./quote/

# 2. 의존성 통합 설치 (핵심 수정 사항)
# 루트 패키지 설치
RUN npm ci --legacy-peer-deps --prefer-offline --no-audit

# quote 전용 패키지 설치 (에러 해결: passport, class-validator 등 설치)
# 이 과정이 있어야 Step 9에서 컴파일 에러가 나지 않습니다.
RUN cd quote && npm install --legacy-peer-deps --prefer-offline --no-audit

# 3. 전역 도구 설치
RUN npm install -g @nestjs/cli

# 4. 소스 코드 복사
COPY . .

# 5. 빌드 수행
RUN cd quote && nest build

# 2단계: 실행 스테이지
FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache libc6-compat

# 6. 결과물 복사
COPY --from=builder /app/quote/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/quote/node_modules ./quote/node_modules
COPY --from=builder /app/quote/package.json ./package.json

EXPOSE 3000
CMD ["node", "dist/main"]
