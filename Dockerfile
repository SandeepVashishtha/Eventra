FROM node:22-alpine AS build
WORKDIR /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY . .
RUN npm run build

FROM nginx:stable-alpine AS serve
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
RUN chown -R appuser:appgroup /usr/share/nginx/html /etc/nginx/conf.d
USER appuser
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
