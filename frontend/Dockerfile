FROM node:18-alpine AS builder
WORKDIR /app
RUN apk add --no-cache python3 make g++

# copy frontend sources
COPY frontend/package*.json ./
COPY frontend/ .
# use npm install instead of npm ci to avoid requiring package-lock.json
RUN npm install --silent
RUN npm run build

FROM nginx:stable-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
