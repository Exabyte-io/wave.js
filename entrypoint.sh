#!/usr/bin/env bash

if [[ "$1" == "test" ]]; then
    xvfb-run -s "-ac -screen 0 1024x768x24" npx jest
else
    npm start
fi
