# 1단계: 빌드 스테이지
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app

# 1. 패키지 파일 복사
COPY package*.json ./
COPY search/package*.json ./search/

# 2. 의존성 설치 (메모리 최적화 옵션)
RUN npm ci --legacy-peer-deps --prefer-offline --no-audit &&     npm install -g @nestjs/cli

# 3. 소스 전체 복사
COPY . .

# 4. 해당 폴더로 이동하여 빌드
RUN cd search && nest build

# 2단계: 실행 스테이지
FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache libc6-compat

# 5. 결과물 복사 (경로 최적화)
COPY --from=builder /app/search/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/search/package.json ./package.json

EXPOSE 3000
CMD ["node", "dist/main"]
