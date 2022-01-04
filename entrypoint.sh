#!/usr/bin/env bash

if [[ "$1" == "test" ]]; then
    JEST="npx jest --config=tests/config.js --env=jsdom"
    xvfb-run -s "-ac -screen 0 1024x768x24" ${JEST} tests/
else
    npm start
fi
