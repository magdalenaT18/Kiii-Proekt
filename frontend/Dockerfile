
FROM node:18-alpine AS builder

WORKDIR /usr/src/app


COPY package*.json ./


RUN npm ci --only=production


COPY . .


RUN npm run build


FROM nginx:alpine

COPY nginx.conf /etc/nginx/nginx.conf


COPY --from=builder /usr/src/app/build /usr/share/nginx/html


RUN adduser -D -s /bin/sh -u 1001 nginx-user


RUN chown -R nginx-user:nginx-user /usr/share/nginx/html && \
    chown -R nginx-user:nginx-user /var/cache/nginx && \
    chown -R nginx-user:nginx-user /var/log/nginx && \
    chown -R nginx-user:nginx-user /etc/nginx/conf.d


RUN touch /var/run/nginx.pid && \
    chown -R nginx-user:nginx-user /var/run/nginx.pid


USER nginx-user


EXPOSE 8080


HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080 || exit 1


CMD ["nginx", "-g", "daemon off;"]