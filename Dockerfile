###################
# STAGE 1: BUILDER
###################
FROM node:20-alpine AS builder

WORKDIR /app

# Copy file dependency
COPY package*.json ./
COPY prisma ./prisma/

# Cài đặt tất cả dependencies (bao gồm devDependencies để build)
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build code ra thư mục dist
RUN npm run build

###################
# STAGE 2: RUNNER
###################
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy package.json để cài lại dependencies cho production
COPY package*.json ./
COPY prisma ./prisma/

# --- QUAN TRỌNG: Cài lại deps production tại đây để fix lỗi bcrypt ---
# Lệnh này chỉ cài dependencies cần thiết, bỏ qua devDependencies -> Nhẹ & Chuẩn OS
RUN npm ci --omit=dev

# Generate lại Prisma Client cho môi trường Runner (đảm bảo an toàn nhất)
RUN npx prisma generate

# Copy folder dist đã build từ Stage 1 sang
COPY --from=builder /app/dist ./dist

EXPOSE 8080

# Chạy app bằng node trực tiếp (nhẹ hơn npm run start:prod)
CMD ["node", "dist/src/main.js"]