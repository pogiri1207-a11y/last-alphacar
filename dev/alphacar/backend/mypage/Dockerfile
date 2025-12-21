# 1단계: 빌드 스테이지
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app

# 1. 패키지 파일 복사
COPY package*.json ./
COPY mypage/package*.json ./mypage/

# 2. 의존성 설치 (메모리 보호를 위해 최적화 옵션 적용)
RUN npm ci --legacy-peer-deps --prefer-offline --no-audit && \
    npm install -g @nestjs/cli

# 3. 소스 전체 복사
COPY . .

# 4. 해당 폴더로 이동하여 전용 라이브러리 설치 및 빌드
RUN cd mypage && \
    npm install --legacy-peer-deps --prefer-offline --no-audit && \
    nest build

# 2단계: 실행 스테이지
FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache libc6-compat

# 5. 결과물 복사 (경로 오류 완벽 해결)
COPY --from=builder /app/mypage/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/mypage/node_modules ./mypage/node_modules
COPY --from=builder /app/mypage/package.json ./package.json

EXPOSE 3000
CMD ["node", "dist/main"]
