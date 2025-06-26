#!/bin/bash
set -e

# Start cron service
service cron start

# Run database migrations
flask db upgrade

# Initial data fetch
flask fetch-exa

# Start the Flask server
flask run --host=0.0.0.0 --port=5000 