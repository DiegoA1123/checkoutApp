FROM node:20-alpine AS build
WORKDIR /app

ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

COPY package*.json ./
COPY apps/web/package*.json apps/web/
COPY apps/web/ apps/web/

WORKDIR /app/apps/web
RUN npm ci
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
EXPOSE 80