FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app

# 1. 루트 및 서비스 패키지 파일 복사
COPY package*.json ./
COPY main/package*.json ./main/

# 2. 의존성 설치 (루트 + Nest CLI)
RUN npm ci --legacy-peer-deps && npm install -g @nestjs/cli

# 3. 소스 코드 전체 복사
COPY . .

# 4. 🔹 [핵심] main 폴더 내부 의존성 추가 설치 및 빌드
# ioredis, class-validator 등이 설치되지 않는 문제를 해결합니다.
RUN cd main && npm install --legacy-peer-deps && nest build

FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache libc6-compat

COPY --from=builder /app/main/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
# main 폴더의 node_modules도 혹시 모르니 포함 (의존성 안전장치)
COPY --from=builder /app/main/node_modules ./main/node_modules
COPY --from=builder /app/main/package.json ./package.json

EXPOSE 3000
CMD ["node", "dist/main"]
