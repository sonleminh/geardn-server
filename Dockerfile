# Stage 1: Build + Prisma generate
FROM node:20-alpine AS builder

WORKDIR /app

# Copy file định nghĩa dependency + prisma
COPY package*.json ./
COPY prisma ./prisma

# Cài deps đầy đủ (cả devDeps để có prisma CLI)
RUN npm ci

# Generate Prisma Client (dựa trên prisma/schema.prisma)
RUN npx prisma generate

# Copy toàn bộ source
COPY . .

# Build NestJS -> dist
RUN npm run build


# Stage 2: Runtime
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Copy package.json để cài deps runtime
COPY package*.json ./

# Cài deps production
RUN npm ci --omit=dev

# Copy Prisma client đã generate từ stage build
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy dist đã build
COPY --from=builder /app/dist ./dist

# Nếu cần, copy schema để sau này migrate (optional)
COPY prisma ./prisma

EXPOSE 8080

CMD ["node", "dist/src/main.js"]
