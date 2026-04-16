# Stage 1: Build
FROM node:18-alpine AS builder

# Install build dependencies for native modules (bcrypt, sharp, etc.) on Alpine
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install dependencies including devDependencies for build
RUN npm install

# Copy source code
COPY . .

# Build the project (generates dist/)
RUN npm run build

# Stage 2: Runtime
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN apk add --no-cache python3 make g++ && \
    npm install --omit=dev && \
    apk del python3 make g++

# Copy the built assets from the builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/swagger.json ./swagger.json

# Copy other necessary files
COPY .env.example .env

# Set Port
ENV PORT=8080

# Non-root user for security
USER node

CMD ["npm", "start"]
