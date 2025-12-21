# --- 1단계: 빌드 스테이지 ---
FROM node:20-alpine AS builder

RUN apk add --no-cache libc6-compat
WORKDIR /app

# 1. 패키지 파일 복사 (루트 기준)
COPY package*.json ./
COPY aichat/package*.json ./aichat/

# 2. 의존성 설치 (루트에서 한 번만)
# 🔹 여기서 'nest' 바이너리가 확실히 생성됩니다.
RUN npm ci --legacy-peer-deps

# 3. 모든 소스 복사
COPY . .

# 4. [핵심 수정] cd 하지 않고 루트에서 npx로 빌드
# 이렇게 하면 경로 문제(127 에러)를 완전히 피할 수 있습니다.
RUN npx nest build aichat

# --- 2단계: 실행 스테이지 ---
FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache libc6-compat

# 5. 결과물 복사 (aichat의 dist 폴더 확인)
COPY --from=builder /app/aichat/dist ./dist
COPY --from=builder /app/aichat/node_modules ./node_modules
COPY --from=builder /app/aichat/package.json ./package.json

EXPOSE 3000
CMD ["node", "dist/main"]
