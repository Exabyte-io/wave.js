#!/bin/bash
# Start vite server in the background
npm run start -- --port 5173 &
VITE_PID=$!

# Wait for vite to start
sleep 3

# Run puppeteer script
node benchmarks/run-puppeteer.js

# Kill vite server
kill $VITE_PID
