# Comments are provided throughout this file to help you get started.
# If you need more help, visit the Dockerfile reference guide at
# https://docs.docker.com/go/dockerfile-reference/

# Want to help us make this template better? Share your feedback here: https://forms.gle/ybq9Krt8jtBL3iCk7


FROM node:latest

# Use development node environment by default.
ENV NODE_ENV development

WORKDIR /app

# Download dependencies as a separate step to take advantage of Docker's caching.
# Leverage a cache mount to /root/.npm to speed up subsequent builds.
# Leverage a bind mounts to package.json and package-lock.json to avoid having to copy them into
# into this layer.
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci

# Fix permissions for node_modules since npm ci ran as root
# and ensure /usr/src/app is writable by node user (for .next creation)
RUN chown -R node:node /app

# Run the application as a non-root user.
USER node

# Copy the rest of the source files into the image.
COPY --chown=node:node . .

# Generate Prisma client for the container's architecture
RUN npx prisma generate

# Expose the port that the application listens on.
EXPOSE 3000

# Run the application.
CMD npm run dev
