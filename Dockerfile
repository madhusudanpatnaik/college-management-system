# Production image for the College Management System.
FROM node:20-alpine

WORKDIR /app
ENV NODE_ENV=production

# Install production dependencies first for better layer caching.
COPY package*.json ./
RUN npm ci --omit=dev

# Copy application source.
COPY . .

# Ensure runtime-writable directories exist and are owned by the unprivileged
# node user, then drop root.
RUN mkdir -p database backend/uploads && chown -R node:node /app
USER node

EXPOSE 3000

# Container health check hits the public liveness probe.
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:'+(process.env.PORT||3000)+'/api/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

CMD ["node", "backend/server.js"]
