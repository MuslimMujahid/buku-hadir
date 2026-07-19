# syntax=docker/dockerfile:1

FROM node:22-alpine AS base

RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

FROM base AS deps

COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS builder
ENV BETTER_AUTH_URL=http://localhost:3000
ENV BETTER_AUTH_SECRET=build-only-secret-replaced-at-runtime
ENV NEXT_PUBLIC_APP_URL=http://localhost:3000
ENV DATABASE_URL=postgresql://absensi:absensi@db:5432/absensi?schema=public


COPY . .
RUN npx prisma generate --schema=prisma/schema.prisma
RUN npm run build

FROM base AS runner

ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

WORKDIR /app

COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Keep the Prisma CLI, generated client, engines, and migration files available
# because migrations run immediately before the production server starts.
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

USER nextjs

EXPOSE 3000

CMD ["sh", "-c", "node_modules/.bin/prisma migrate deploy --schema=prisma/schema.prisma && exec node server.js"]
