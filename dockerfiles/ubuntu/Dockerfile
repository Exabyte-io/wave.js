FROM ubuntu:latest

# Install base dependencies
RUN apt-get update && apt-get install -y -q --no-install-recommends \
        apt-transport-https \
        build-essential \
        ca-certificates \
        curl \
        git \
        libssl-dev \
        wget \
        xvfb \
        libgl1-mesa-dev \
    && rm -rf /var/lib/apt/lists/*

# Install nvm with node and npm
ENV NVM_DIR /usr/local/nvm
ENV NODE_VERSION 12.21.0
RUN mkdir /usr/local/nvm
RUN curl -sL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash \
    && . $NVM_DIR/nvm.sh \
    && nvm install $NODE_VERSION \
    && nvm alias default $NODE_VERSION \
    && nvm use default
ENV NODE_PATH $NVM_DIR/v$NODE_VERSION/lib/node_modules
ENV PATH      $NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH

# Install application
WORKDIR /opt/app

COPY . .

RUN npm install

ENTRYPOINT ["/opt/app/entrypoint.sh"]
