FROM node:20-alpine AS build
WORKDIR /service
COPY tsconfig.base.json /tsconfig.base.json
COPY services/fake-mail/package.json ./
RUN npm install
COPY services/fake-mail/tsconfig.json ./
COPY services/fake-mail/src ./src
RUN npm run build

FROM node:20-alpine
WORKDIR /service
COPY services/fake-mail/package.json ./
RUN npm install --omit=dev
COPY --from=build /service/dist ./dist
CMD ["node", "dist/server.js"]
