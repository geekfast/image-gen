#!/bin/bash
cd "$(dirname "$0")"
echo "Building backend..."
npx tsc
echo "Starting backend server..."
node dist/server.js
