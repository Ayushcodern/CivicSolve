# ============================================================
# CivicSolve — Vite React Frontend Dockerfile (Development)
# ============================================================
# Base: Node 20 Alpine for minimal image size
# Runs Vite dev server with --host for container access
# ============================================================

FROM node:20-alpine

WORKDIR /app

# Copy package files first for dependency layer caching
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Copy application source
COPY . .

# Expose Vite dev server port
EXPOSE 5173

# Run Vite dev server bound to all interfaces for Docker access
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
