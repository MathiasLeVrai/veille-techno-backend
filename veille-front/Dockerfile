FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Les variables VITE_* sont figées dans le JS au moment du build
ARG VITE_PRIMEVUE_LICENSE=""
ENV VITE_PRIMEVUE_LICENSE=$VITE_PRIMEVUE_LICENSE
RUN npm run build

FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
