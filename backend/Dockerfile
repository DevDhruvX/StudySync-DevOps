# Backend Dockerfile for StudySync
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create uploads directory with proper permissions
RUN mkdir -p uploads && chmod 755 uploads

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S studysync -u 1001

# Change ownership of app directory
RUN chown -R studysync:nodejs /app

# Switch to non-root user
USER studysync

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

# Start the application
CMD ["node", "server-production.js"]