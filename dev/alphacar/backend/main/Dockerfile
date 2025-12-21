# 1단계: 빌드 스테이지
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app

# 1. 패키지 파일 복사 (루트 및 서비스)
COPY package*.json ./
COPY main/package*.json ./main/

# 2. 의존성 설치 및 Nest CLI 전역 설치
RUN npm ci --legacy-peer-deps && npm install -g @nestjs/cli

# 3. 소스 전체 복사 (tsconfig.json, nest-cli.json, libs 폴더 등이 모두 포함됨)
COPY . .

# 4. 🔹 해당 폴더로 이동하여 빌드 (tsconfig 에러 해결)
RUN cd main && nest build

# 2단계: 실행 스테이지
FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache libc6-compat

# 5. 결과물 복사 (절대 경로 주의)
COPY --from=builder /app/main/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/main/package.json ./package.json

EXPOSE 3000
CMD ["node", "dist/main"]
