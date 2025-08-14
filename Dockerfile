# Use the official Node.js 18 image as the base image
FROM node:18.19.1-alpine3.19 AS base

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .
COPY prisma ./prisma

# Build the Next.js application
RUN npm run build

# Production image
FROM node:18-alpine AS runner

WORKDIR /app

# Copy necessary files from the build stage
COPY --from=base /app/next.config.js ./
COPY --from=base /app/public ./public
COPY --from=base /app/.next ./.next
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./

# Expose the port Next.js runs on
EXPOSE 3000

# Set the command to start the Next.js application
CMD ["npm", "start"]