FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package*.json ./
COPY prisma ./prisma
RUN npm install --omit=dev && npx prisma generate

FROM base AS runner
ENV NODE_ENV=production
RUN addgroup -S app && adduser -S app -G app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma ./prisma
COPY package*.json ./
COPY src ./src
RUN mkdir -p uploads/tickets && chown -R app:app uploads
USER app
EXPOSE 4000
CMD ["sh", "-c", "npx prisma migrate deploy && node src/index.js"]
