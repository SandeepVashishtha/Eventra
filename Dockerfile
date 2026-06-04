FROM node:22-alpine AS build
WORKDIR /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
RUN npm ci --prefer-offline --no-audit --no-fund
COPY . .
RUN npm run build

FROM nginx:stable-alpine AS serve
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
RUN chown -R appuser:appgroup /usr/share/nginx/html /etc/nginx/conf.d
USER appuser
RUN apk add --no-cache wget
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1
CMD ["nginx", "-g", "daemon off;"]
