# Builder
FROM node:alpine as builder

ENV CI=true

WORKDIR /app
COPY package.json ./
RUN yarn install
COPY ./ ./
RUN yarn build

# Production
FROM nginx:stable-alpine
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
