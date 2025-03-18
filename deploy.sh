#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting deployment process..."

# Build the application
echo "📦 Building the application..."
npm run build

# Create necessary directories on the server
REMOTE_DIR="/var/www/html/dadjokes"
REMOTE_USER="gracy"
REMOTE_HOST="167.172.234.61"

# Copy files to server
echo "📤 Copying files to server..."
rsync -avz --delete \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude '.env.local' \
  ./ $REMOTE_USER@$REMOTE_HOST:$REMOTE_DIR/

# Copy environment variables (make sure to set these up on your server)
echo "🔑 Copying environment variables..."
scp .env.local $REMOTE_USER@$REMOTE_HOST:$REMOTE_DIR/.env

# Install dependencies and restart the application on the server
echo "🔄 Installing dependencies and restarting application..."
ssh $REMOTE_USER@$REMOTE_HOST "cd $REMOTE_DIR && \
  npm install --production && \
  pm2 delete dad-jokes || true && \
  pm2 start ecosystem.config.js"

echo "✅ Deployment complete!" 