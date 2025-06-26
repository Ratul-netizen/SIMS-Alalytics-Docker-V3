FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    dos2unix \
    cron \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Download the spaCy English model
RUN python -m spacy download en_core_web_sm

# Create instance directory for database
RUN mkdir -p /app/instance && chmod 777 /app/instance

# Copy application code
COPY . .
COPY migrations/ ./migrations/

# Ensure proper permissions
RUN chmod -R 755 /app

# Convert entrypoint.sh to Unix format and set permissions
RUN dos2unix /app/entrypoint.sh && \
    chmod +x /app/entrypoint.sh

# Setup cron job for data updates
RUN echo "0 */6 * * * cd /app && flask fetch-exa >> /var/log/cron.log 2>&1" > /etc/cron.d/fetch-exa-cron && \
    chmod 0644 /etc/cron.d/fetch-exa-cron && \
    crontab /etc/cron.d/fetch-exa-cron

EXPOSE 5000

ENTRYPOINT ["/app/entrypoint.sh"] 