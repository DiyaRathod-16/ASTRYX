# Backend Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built files
COPY --from=builder /app/dist ./dist

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S astryx -u 1001
USER astryx

# Railway sets PORT dynamically
ENV PORT=3001

# Expose port (Railway ignores this and uses PORT env)
EXPOSE 3001

# Start the application
CMD ["node", "dist/index.js"]
