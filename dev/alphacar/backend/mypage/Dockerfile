FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package*.json ./
COPY mypage/package*.json ./mypage/

RUN npm ci --legacy-peer-deps && npm install -g @nestjs/cli

COPY . .

# 🔹 [핵심] mypage 폴더 내부 의존성 추가 설치 및 빌드
# axios, jwt 모듈 누락 에러를 해결합니다.
RUN cd mypage && npm install --legacy-peer-deps && nest build

FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache libc6-compat

COPY --from=builder /app/mypage/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/mypage/node_modules ./mypage/node_modules
COPY --from=builder /app/mypage/package.json ./package.json

EXPOSE 3000
CMD ["node", "dist/main"]
