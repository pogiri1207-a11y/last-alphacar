# 1단계: 빌드 스테이지
FROM node:20-alpine AS builder

# Alpine에서 빌드 시 필요한 필수 라이브러리
RUN apk add --no-cache libc6-compat
WORKDIR /app

# 1. 패키지 파일 복사
COPY package*.json ./
COPY aichat/package*.json ./aichat/

# 2. 의존성 설치 (루트에서 진행)
RUN npm ci --legacy-peer-deps

# 3. 소스 전체 복사
COPY . .

# 4. 🔹 [핵심 수정] npx 대신 직접 실행 파일 경로 지정
# npx nest build aichat 대신 바이너리 위치를 직접 찔러줍니다.
RUN ./node_modules/.bin/nest build aichat

# 2단계: 실행 스테이지
FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache libc6-compat

# 5. 빌드 결과물만 복사
COPY --from=builder /app/aichat/dist ./dist
COPY --from=builder /app/aichat/node_modules ./node_modules
COPY --from=builder /app/aichat/package.json ./package.json

EXPOSE 3000
CMD ["node", "dist/main"]
