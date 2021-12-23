#!/usr/bin/env bash

# babel/runtime moved core-js into babel/runtime-corejs2, hence the below.
if [[ -d node_modules/@babel/runtime ]]; then
    cd node_modules/@babel/runtime
    ln -sf ../runtime-corejs2/core-js .
    cd -
fi

JEST="npx jest --config=tests/config.js --env=jsdom"
xvfb-run -s "-ac -screen 0 1024x768x24" ${JEST} tests/
