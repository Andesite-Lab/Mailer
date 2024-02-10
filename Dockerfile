FROM node:21.6-alpine as builder
WORKDIR /build
RUN apk update --no-cache
RUN apk add --no-cache git
RUN npm install -g pnpm typescript
COPY package.json .
RUN pnpm install
COPY . .
RUN pnpm run prod::build
RUN pnpm prune --prod

FROM node:21.6-alpine
WORKDIR /
COPY --from=builder /build/node_modules ./node_modules
COPY --from=builder /build/package.json ./package.json
COPY --from=builder /build/Assets ./Assets
COPY --from=builder /build/Build ./Build
CMD npm run prod::migrate && npm run prod::seed && npm run prod::start
