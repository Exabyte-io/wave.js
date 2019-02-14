#!/usr/bin/env bash

export NVM_DIR="/root/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

yum install -y libXext-devel libXi-devel mesa-libGL-devel mesa-dri-drivers xorg-x11-server-Xvfb

npm install

# we need to split the tests due to https://github.com/facebook/jest/issues/2029
JEST="./node_modules/.bin/jest --config=tests/config.js --env=jsdom"
xvfb-run -s "-ac -screen 0 1024x768x24" ${JEST} tests/__tests__/wave.js &&
xvfb-run -s "-ac -screen 0 1024x768x24" ${JEST} tests/__tests__/mixins/atoms.js &&
xvfb-run -s "-ac -screen 0 1024x768x24" ${JEST} tests/__tests__/mixins/controls.js &&
xvfb-run -s "-ac -screen 0 1024x768x24" ${JEST} tests/__tests__/components
