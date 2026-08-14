# Use an official Node.js image with a version that supports modern JavaScript features
FROM node:20

# Install system dependencies for OpenGL, Python, and build tools
RUN apt-get update && apt-get install -y \
    python3 \
    python3-distutils \
    build-essential \
    libgl1-mesa-dev \
    libxi-dev \
    libxmu-dev \
    libgles2-mesa-dev \
    libx11-dev \
    xvfb \
    && ln -s /usr/bin/python3 /usr/bin/python \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory inside the container
WORKDIR /opt/app

# Copy package.json and package-lock.json for dependency installation
COPY package*.json ./
COPY src ./src
COPY tsconfig.json ./tsconfig.json
COPY babel.config.json ./babel.config.json

# Install project dependencies.
#
# Retried for the same reason as the `verify` job in .github/workflows/cicd.yml: `sharp` (a
# transitive dev dependency of `looks-same`) fetches a prebuilt libvips tarball from GitHub
# Releases at install time, and a 503 there sends it down a source-compile path this image has
# no libvips headers for - failing the image build on commits that changed nothing relevant.
RUN for attempt in 1 2 3; do \
        npm ci && exit 0; \
        echo "npm ci failed (attempt $attempt of 4) - retrying"; \
        sleep $((attempt * 15)); \
    done; \
    npm ci

# Copy the entire repository into the container
COPY . .

# Ensure the node_modules folder is accessible
# RUN chmod -R 755 /opt/app/node_modules

# Expose any required ports (if applicable)
EXPOSE 3002

ENTRYPOINT ["/opt/app/entrypoint.sh"]
