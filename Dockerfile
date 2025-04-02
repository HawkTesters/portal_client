# Base image with Node.js (LTS)
FROM node:20-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# Build app and prepare Prisma seed files
FROM deps AS builder
WORKDIR /app
COPY . .
RUN npx prisma generate
RUN npm run build
RUN npm run seedProd:build
# Move isaac_cv.json into dist/prisma for the seed
RUN mkdir -p dist/prisma && cp prisma/isaac_cv.json dist/prisma/

# Production image
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV production

# Install only production dependencies
COPY package.json package-lock.json* ./
RUN npm install --production

# Copy the built application from the builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Expose the port the app runs on
EXPOSE 9085

# Run Prisma migrations, seed, and start the app
CMD ["sh", "-c", "npx prisma generate && npx prisma migrate deploy && npm run seedProd && npm start"]