FROM node:24-alpine AS build
WORKDIR /app
# sqlite3 compile ses binaires natifs au npm ci (pas de prebuild fiable sur toutes les archis)
RUN apk add --no-cache python3 make g++
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build && npm prune --omit=dev

FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production
# Réutilise node_modules déjà compilés (évite un 2e npm ci sans python/make)
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json
COPY kanban.sqlite /data/kanban.sqlite
RUN chown -R node:node /data
USER node
ENV DB_PATH=/data/kanban.sqlite
EXPOSE 3000
CMD ["node", "dist/main"]
