#!/usr/bin/env bash

if [[ "$1" == "test" ]]; then
    xvfb-run -s "-ac -screen 0 1024x768x24" npm test
else
    npm start
fi
