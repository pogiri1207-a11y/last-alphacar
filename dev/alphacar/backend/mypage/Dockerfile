# 1단계: 빌드 스테이지
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app

# 1. 패키지 파일 복사
COPY package*.json ./
COPY mypage/package*.json ./mypage/

# 2. 의존성 설치 및 Nest CLI 전역 설치
RUN npm ci --legacy-peer-deps && npm install -g @nestjs/cli

# 3. 소스 코드 복사
COPY . .

# 4. 빌드 실행
RUN nest build mypage

# 2단계: 실행 스테이지
FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache libc6-compat

# 5. 결과물 복사
COPY --from=builder /app/mypage/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/mypage/package.json ./package.json

EXPOSE 3000
CMD ["node", "dist/main"]
