# Dockerfile for Railway/Production Deployment
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Generate Prisma client
WORKDIR /app/apps/api
RUN npx prisma generate

# Build (if needed)
# RUN npm run build

# Expose port
EXPOSE 3001

# Start application
CMD ["npm", "run", "start"]

