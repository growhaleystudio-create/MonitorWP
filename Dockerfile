# ================================================
# Build Stage 1: Build Frontend (Vite + React)
# ================================================
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# ================================================
# Build Stage 2: Build Backend (TypeScript + Prisma)
# ================================================
FROM node:20-alpine AS backend-builder
WORKDIR /app/backend

COPY backend/package*.json ./
COPY backend/prisma ./prisma/
RUN npm ci

COPY backend/ ./
RUN npx prisma generate
RUN npm run build

# ================================================
# Stage 3: Production Server
# ================================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install openssl for Prisma
RUN apk add --no-cache openssl

COPY backend/package*.json ./backend/
COPY backend/prisma ./backend/prisma/

WORKDIR /app/backend
RUN npm ci --only=production

COPY --from=backend-builder /app/backend/dist ./dist
COPY --from=backend-builder /app/backend/node_modules/@prisma ./node_modules/@prisma
COPY --from=frontend-builder /app/frontend/dist ../frontend/dist

EXPOSE 3000

CMD ["sh", "-c", "npx prisma db push && node dist/index.js"]
