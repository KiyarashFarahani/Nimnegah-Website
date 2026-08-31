FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Ensure Plyr SVG sprite is self-hosted (fixes VPS CSP blocking cdn.plyr.io)
RUN cp node_modules/plyr/dist/plyr.svg public/plyr.svg 2>/dev/null || true
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

RUN mkdir -p /app/media /app/.next/cache && chown -R nextjs:nodejs /app/media /app/.next

USER nextjs
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
