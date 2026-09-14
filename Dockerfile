FROM node:22.19-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.28.0 --activate
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile=false
RUN pnpm db:generate
RUN pnpm --filter @explainara/web build
EXPOSE 3000
CMD ["pnpm","--filter","@explainara/web","start"]
