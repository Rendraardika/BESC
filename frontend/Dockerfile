FROM node:20-bullseye AS builder
WORKDIR /app
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

# copy frontend sources
COPY frontend/package*.json ./
COPY frontend/ .
# use npm install instead of npm ci to avoid requiring package-lock.json
RUN npm install --silent

# add small polyfill for CustomEvent so build tools that reference it won't crash
RUN printf "if (typeof globalThis.CustomEvent === 'undefined') { globalThis.CustomEvent = function(type, params) { params = params || { bubbles: false, cancelable: false, detail: undefined }; var e = { type: type, bubbles: params.bubbles, cancelable: params.cancelable, detail: params.detail }; return e; } }\n" > /app/polyfill.js
ENV NODE_OPTIONS="--require /app/polyfill.js"
RUN npm run build

FROM nginx:stable-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
