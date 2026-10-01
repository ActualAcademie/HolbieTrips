FROM node:20-alpine AS build
WORKDIR /workspace
COPY package.json package-lock.json* tsconfig.base.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY services/fake-payment/package.json services/fake-payment/package.json
COPY services/fake-mail/package.json services/fake-mail/package.json
RUN --mount=type=cache,target=/root/.npm \
    npm ci --no-audit --no-fund --strict-ssl=false \
    && test -x node_modules/.bin/tsc \
    && test -x node_modules/.bin/vite
COPY . .
RUN npm run build

FROM node:20-alpine
ENV NODE_ENV=production
WORKDIR /workspace
COPY --from=build /workspace /workspace
EXPOSE 8080
CMD ["node", "apps/api/dist/server.js"]
