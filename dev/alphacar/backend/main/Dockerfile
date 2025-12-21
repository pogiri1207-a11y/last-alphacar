# 1단계: 빌드 스테이지
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app

# 1. 패키지 파일 복사
COPY package*.json ./
COPY main/package*.json ./main/

# 2. 의존성 설치 및 Nest CLI 전역 설치 (에러 해결 핵심)
RUN npm ci --legacy-peer-deps && npm install -g @nestjs/cli

# 3. 소스 및 공통 라이브러리 복사
COPY . .

# 4. 빌드 실행 (npx 없이 전역 nest 사용)
RUN nest build main

# 2단계: 실행 스테이지
FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache libc6-compat

# 5. 결과물 복사 (경로 주의: /app/node_modules에서 가져옴)
COPY --from=builder /app/main/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/main/package.json ./package.json

EXPOSE 3000
CMD ["node", "dist/main"]
