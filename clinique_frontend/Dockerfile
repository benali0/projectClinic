# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Serve stage
FROM nginx:alpine
# Angular build output: souvent dist/<project-name>/...
# On va copier tout dist/ vers nginx html
COPY --from=build /app/dist/ /usr/share/nginx/html
EXPOSE 80