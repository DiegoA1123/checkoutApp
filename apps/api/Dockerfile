FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
COPY apps/api/package*.json apps/api/
COPY apps/api/ apps/api/

COPY apps/api/prisma ./apps/api/prisma
COPY apps/api/prisma.config.ts ./apps/api/prisma.config.ts

WORKDIR /app/apps/api

RUN npm ci
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine
WORKDIR /app/apps/api

COPY --from=build /app/apps/api/node_modules ./node_modules
COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/apps/api/package*.json ./
COPY --from=build /app/apps/api/prisma ./prisma
COPY --from=build /app/apps/api/prisma.config.ts ./prisma.config.ts

EXPOSE 3000

CMD ["sh", "-c", "set -e; \
npx prisma migrate deploy; \
if [ \"$RUN_SEED\" = \"true\" ]; then \
  SEED=$(find dist -maxdepth 5 -type f -name 'seed.js' | head -n 1); \
  [ -n \"$SEED\" ] && node $SEED; \
fi; \
node dist/main.js || node dist/src/main.js"]