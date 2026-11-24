# syntax=docker/dockerfile:1
# Multi-stage build for Dokku. Produces a small Next.js standalone image.

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    TZ=Europe/Vienna
RUN apk add --no-cache tzdata
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public
# Migrations run via Dokku predeploy (app.json): need the script, SQL files and pg
COPY --from=build --chown=node:node /app/scripts/migrate.mjs ./scripts/migrate.mjs
COPY --from=build --chown=node:node /app/db ./db
COPY --from=deps --chown=node:node /app/node_modules/pg ./node_modules/pg
USER node
EXPOSE 3000
CMD ["node", "server.js"]
