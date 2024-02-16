# build stage
FROM node:alpine AS build
WORKDIR /build
COPY . .
RUN npm install
RUN npm run type-check && \
  npm run lint && \
  npm run circular-dep-check && \
  npm run test:unit -- --run && \
  npm run build

# production stage
FROM node:alpine AS production
USER node
WORKDIR /app
COPY --from=build --chown=node:node /build/package.json /build/package-lock.json /build/dist .
RUN npm install --omit=dev
CMD ["node", "main.js"]
