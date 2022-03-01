ARG BASE_IMAGE
FROM $BASE_IMAGE

# Install application
WORKDIR /opt/app

COPY . .

RUN source scl_source enable devtoolset-8 && \
    npm install

EXPOSE 3002

ENTRYPOINT ["/opt/app/entrypoint.sh"]
