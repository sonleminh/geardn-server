FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Cài dependency
COPY package*.json ./
RUN npm ci

# Copy source và build
COPY . .
RUN npm run build

# --------- Runtime image (nhỏ, chỉ chứa dist + node_modules prod) ----------
FROM node:20-alpine AS runner

WORKDIR /usr/src/app

ENV NODE_ENV=production

# Copy node_modules và dist từ builder
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/.env.production ./.env.production

EXPOSE 3000

CMD ["node", "dist/main.js"]
