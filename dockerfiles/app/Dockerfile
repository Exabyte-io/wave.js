ARG BASE_IMAGE
ARG IMAGE_TAG=latest
FROM ${BASE_IMAGE}:${IMAGE_TAG}

# Install application
WORKDIR /opt/app

COPY . .

RUN source scl_source enable devtoolset-8 && \
    npm install

EXPOSE 3002

ENTRYPOINT ["/opt/app/entrypoint.sh"]

