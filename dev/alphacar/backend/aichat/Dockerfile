# 1단계: 빌드 스테이지
FROM node:20-alpine AS builder

RUN apk add --no-cache libc6-compat
WORKDIR /app

# 1. 패키지 파일 복사 (루트 기준)
COPY package*.json ./
COPY aichat/package*.json ./aichat/

# 2. 의존성 설치 및 Nest CLI 전역 설치 (에러 127 해결 핵심)
RUN npm ci --legacy-peer-deps && npm install -g @nestjs/cli

# 3. 소스 코드 복사
COPY . .

# 4. 빌드 실행 (해당 폴더로 이동 후 전역 nest 사용)
RUN cd aichat && nest build

# 2단계: 실행 스테이지
FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache libc6-compat

# 5. 빌드 결과물 및 필수 파일만 복사
COPY --from=builder /app/aichat/dist ./dist
COPY --from=builder /app/aichat/node_modules ./node_modules
COPY --from=builder /app/aichat/package.json ./package.json

EXPOSE 3000
CMD ["node", "dist/main"]
