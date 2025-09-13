# Build stage
FROM node:18.17.1-alpine3.18 as builder

WORKDIR /app

# Set npm to run as non-root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup && \
    chown -R appuser:appgroup /app
USER appuser

# Copy package files
COPY --chown=appuser:appgroup package*.json ./
COPY --chown=appuser:appgroup tsconfig.json ./

# Install dependencies with security audit and exact versions
RUN npm ci --audit=true --fund=false --loglevel=error && \
    npm cache clean --force

# Copy source code
COPY --chown=appuser:appgroup . .

# Build application
RUN npm run build

# Production stage
FROM node:18.17.1-alpine3.18

# Install security updates and create non-root user
RUN apk update && \
    apk upgrade && \
    apk add --no-cache tini && \
    addgroup -S appgroup && \
    adduser -S appuser -G appgroup && \
    mkdir -p /app && \
    chown -R appuser:appgroup /app

WORKDIR /app

# Copy package files and built code
COPY --from=builder --chown=appuser:appgroup /app/package*.json ./
COPY --from=builder --chown=appuser:appgroup /app/dist ./dist

# Install production dependencies only with security audit
RUN npm ci --only=production --audit=true --fund=false --loglevel=error && \
    npm cache clean --force

# Set user to non-root
USER appuser

# Use tini as init
ENTRYPOINT ["/sbin/tini", "--"]

# Expose port
EXPOSE 3000

# Start application
CMD ["node", "dist/index.js"]

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget -q --spider http://localhost:3000/health || exit 1

# Start application
CMD ["npm", "start"]
