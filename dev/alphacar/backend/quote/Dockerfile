# 1단계: 빌드 스테이지
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app

# [전문가 팁] 네트워크 타임아웃 방지 설정 추가
RUN npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retries 5

# 1. 패키지 파일들만 먼저 복사 (캐시 효율 극대화)
# 소스 코드가 바뀌어도 패키지 목록이 안 바뀌면 이 단계는 1초만에 넘어갑니다.
COPY package*.json ./
COPY quote/package*.json ./quote/

# 2. 의존성 설치 (통합 설치)
# 루트와 하위 폴더 의존성을 한 번에 해결하기 위해 최적화 옵션 적용
RUN npm ci --legacy-peer-deps --prefer-offline --no-audit

# 3. 소스 코드 전체 복사
COPY . .

# 4. 빌드 수행 (NestJS CLI를 전역 설치 대신 npx로 실행하여 속도 향상)
RUN cd quote && npx nest build

# [전문가 팁] 운영 환경에 필요 없는 devDependencies 삭제 (이미지 용량 절감)
RUN npm prune --production --legacy-peer-deps


# 2단계: 실행 스테이지 (용량 최적화)
FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache libc6-compat

# 보안을 위해 환경 변수 설정
ENV NODE_ENV=production

# 5. 실행에 꼭 필요한 결과물만 복사 (빌드 결과물 + 라이브러리)
# 루트 node_modules에 실제 실행 라이브러리가 모여 있으므로 이를 복사합니다.
COPY --from=builder /app/quote/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/quote/package.json ./package.json

# 서비스 포트 (Argo CD 설정에 맞춰 3000번 노출)
EXPOSE 3000

# 실행 명령어
CMD ["node", "dist/main"]
