FROM node:22-alpine AS build
WORKDIR /app
RUN npm install pnpm -g
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --store-dir=/pnpm/store
COPY . .
RUN pnpm run build

FROM nginx:1-alpine
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
