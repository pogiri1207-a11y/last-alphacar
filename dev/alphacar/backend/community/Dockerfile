# 1단계: 빌드 스테이지
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app

# 1. 패키지 파일 복사
COPY package*.json ./
COPY community/package*.json ./community/

# 2. 루트 의존성 및 CLI 설치 (캐시 활용)
RUN npm ci --legacy-peer-deps --prefer-offline --no-audit && \
    npm install -g @nestjs/cli

# 3. 소스 전체 복사
COPY . .

# 4. [수정됨] 해당 서비스 전용 라이브러리 설치 후 빌드
# --production 옵션을 빼서 빌드 시 필요한 devDependencies까지 확실히 설치합니다.
RUN cd community && \
    npm install --legacy-peer-deps --prefer-offline --no-audit && \
    nest build

# 2단계: 실행 스테이지
FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache libc6-compat

# 5. 결과물 복사
COPY --from=builder /app/community/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
# 서비스 전용 모듈도 포함하여 에러 방지
COPY --from=builder /app/community/node_modules ./community/node_modules
COPY --from=builder /app/community/package.json ./package.json

EXPOSE 3000
CMD ["node", "dist/main"]
