# Build stage
FROM node:20-slim AS builder

WORKDIR /app

# Install build dependencies for better-sqlite3
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package.json yarn.lock ./
COPY demo-app/package.json ./demo-app/
COPY sdk-app/package.json ./sdk-app/
COPY cxone-chat/package.json ./cxone-chat/
COPY backend/package.json ./backend/

# Install all dependencies
RUN yarn install --frozen-lockfile

# Copy source files
COPY demo-app/ ./demo-app/
COPY sdk-app/ ./sdk-app/
COPY cxone-chat/ ./cxone-chat/
COPY backend/ ./backend/
COPY server.production.js ./

# Build all packages
# Set production backend URL for cxone-chat build
ENV BACKEND_URL=""
RUN yarn build:cxone-chat
RUN yarn build:sdk
RUN yarn build:demo

# Production stage
FROM node:20-slim AS production

WORKDIR /app

# Install runtime dependencies for better-sqlite3
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy package files for production install
COPY package.json yarn.lock ./
COPY backend/package.json ./backend/

# Install only production dependencies
RUN yarn install --frozen-lockfile --production

# Copy built assets from builder
COPY --from=builder /app/demo-app/dist ./demo-app/dist
COPY --from=builder /app/sdk-app/dist ./sdk-app/dist
COPY --from=builder /app/cxone-chat/dist ./cxone-chat/dist
COPY --from=builder /app/server.production.js ./

# Create data directory for SQLite
RUN mkdir -p /data

ENV NODE_ENV=production
ENV DATABASE_PATH=/data/conversations.db
ENV PORT=8080

EXPOSE 8080

CMD ["node", "server.production.js"]
