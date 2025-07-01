# SIMS Analytics Deployment Guide

## VM Deployment Troubleshooting

### Common Issues and Solutions

#### 1. "Could not fetch data" Error

This error typically occurs due to network configuration issues when deploying to a VM.

**Solutions:**

1. **Check Backend Accessibility**
   ```bash
   # Test if backend is running
   curl http://YOUR_VM_IP:5000/api/health
   ```

2. **Check Firewall Settings**
   ```bash
   # Allow ports 3000 and 5000
   sudo ufw allow 3000
   sudo ufw allow 5000
   ```

3. **Verify Docker Services**
   ```bash
   # Check if containers are running
   docker ps
   
   # Check container logs
   docker logs sims_backend
   docker logs sims_frontend
   ```

#### 2. CORS Issues

The backend is configured to handle CORS for VM deployment, but you may need to adjust:

**Backend CORS Configuration:**
- The backend allows all origins (`*`) for API endpoints
- Supports credentials and common HTTP methods
- Configured for both localhost and VM IP access

#### 3. Network Configuration

**Frontend API Configuration:**
- Frontend automatically detects if running on localhost vs VM
- For VM deployment, it uses `http://YOUR_VM_IP:5000` for backend calls
- Make sure port 5000 is accessible from the frontend

### Deployment Steps

1. **Build and Start Services**
   ```bash
   docker-compose up --build -d
   ```

2. **Check Service Health**
   ```bash
   # Backend health check
   curl http://localhost:5000/api/health
   
   # Frontend should be accessible at
   http://YOUR_VM_IP:3000
   ```

3. **Verify Database**
   ```bash
   # Check database stats
   curl http://localhost:5000/api/database-stats
   ```

### Environment Variables

Make sure your `.env` file in the backend directory contains:
```
EXA_API_KEY=your_exa_api_key_here
FLASK_ENV=production
```

### Troubleshooting Commands

```bash
# Restart services
docker-compose restart

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Rebuild and restart
docker-compose down
docker-compose up --build -d

# Check network connectivity
docker network ls
docker network inspect sims_analytics_sims_network
```

### Port Configuration

- **Frontend**: Port 3000
- **Backend**: Port 5000
- **Database**: SQLite (file-based, no external port needed)

### Security Considerations

1. **Firewall**: Only expose necessary ports (3000, 5000)
2. **Environment Variables**: Keep API keys secure
3. **HTTPS**: Consider using a reverse proxy with SSL for production

### Monitoring

The application includes health check endpoints:
- `/api/health` - Backend health status
- `/api/database-stats` - Database statistics

Use these to monitor the application status. 