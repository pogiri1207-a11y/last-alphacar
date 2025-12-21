# --- 1단계: 빌드 스테이지 ---
FROM node:20-alpine AS builder

RUN apk add --no-cache libc6-compat
WORKDIR /app

# 1. 패키지 파일 복사
COPY package*.json ./
COPY aichat/package*.json ./aichat/

# 2. 의존성 설치 (여기서 이미 nest cli가 설치됩니다)
RUN npm ci --legacy-peer-deps

# 3. 소스 코드 복사
COPY . .

# 4. [핵심 수정] 글로벌 설치 없이 실행 (npx 사용)
# PATH에 루트의 bin 폴더를 추가하여 nest 명령어를 바로 인식하게 합니다.
ENV PATH /app/node_modules/.bin:$PATH

RUN cd aichat && \
    echo "🚀 Starting nest build for aichat..." && \
    NODE_OPTIONS="--max-old-space-size=2048" nest build
