#!/usr/bin/env bash
set -eo pipefail

if [[ -z "${CI}" ]]; then
  trap "exit" INT TERM
  trap "kill 0" EXIT
fi

# Set HMAC key ID
export HMAC_KEY_ID="key"

# Generate a random HMAC secret
HMAC_SECRET="$(head /dev/urandom | LC_ALL=C tr -dc A-Za-z0-9 | head -c24)"
export HMAC_SECRET

# Function to log messages
log() {
  echo -e "[35m[run.sh][0m $1"
}

# Start the server
npm run server &
log "Server starting with HMAC_SECRET=${HMAC_SECRET}"

# Wait for the server to start
sleep_duration=2
log "Waiting ${sleep_duration} seconds for the server to start..."
sleep ${sleep_duration}

# Run the client with valid credentials
log "Running client with valid credentials, HMAC_SECRET=${HMAC_SECRET}"
npm run client

# Run the client with invalid credentials
invalid_secret="wrong-secret"
export HMAC_SECRET="${invalid_secret}"
log "Running client with invalid credentials, HMAC_SECRET=${HMAC_SECRET}"
npm run client

