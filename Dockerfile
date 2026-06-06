FROM node:22-alpine AS build
WORKDIR /app

# Copy dependency manifests first for Docker layer caching
COPY package.json package-lock.json ./

# Install dependencies with BuildKit cache mount for npm cache persistence
# --mount=type=cache preserves ~/.npm across builds so npm doesn't re-download
# packages that are already cached from previous builds
RUN --mount=type=cache,target=/root/.npm \
    npm ci --prefer-offline --no-audit --no-fund --cache /root/.npm

# Copy source code and build
COPY . .
RUN npm run build

FROM nginx:stable-alpine AS serve
RUN apk add --no-cache wget
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1
CMD ["nginx", "-g", "daemon off;"]
