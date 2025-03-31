# Base image with Node.js (LTS)
FROM node:20-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# Build app and prepare prisma seed files
FROM deps AS builder
COPY . .
RUN npm run build
RUN npm run seedProd:build
# Move isaac_cv.json into dist/prisma
RUN mkdir -p dist/prisma && cp prisma/isaac_cv.json dist/prisma/

# Production image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

# Install only production dependencies
COPY package.json package-lock.json* ./
RUN npm install --production

# Copy built files from builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/tsconfig.json ./

# Expose port
EXPOSE 3000

# Run Prisma migration, seed, and start app
CMD ["sh", "-c", "npx prisma migrate deploy && npm run seedProd && npm start"]
