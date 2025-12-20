# NAS Deployment Guide

Complete guide for deploying the Bookmarks app on your NAS (Synology, QNAP, TrueNAS, etc.)

## Prerequisites

- NAS with Docker support
- SSH access to your NAS
- Neon PostgreSQL database (get from [console.neon.tech](https://console.neon.tech/))
- OpenAI API key (get from [platform.openai.com/api-keys](https://platform.openai.com/api-keys))

## Quick Setup

### 1. SSH into Your NAS

```bash
ssh maxjeffwell@192.168.50.142 -p 54321
```

### 2. Navigate to Your Apps Directory

```bash
# For Synology
cd /volume1/docker/bookmarks

# For QNAP
cd /share/Container/bookmarks

# Or create your own directory
mkdir -p ~/apps/bookmarks && cd ~/apps/bookmarks
```

### 3. Clone or Upload the Repository

**Option A: Using Git**
```bash
git clone https://github.com/maxjeffwell/bookmarks-react-hooks.git .
```

**Option B: Upload via SCP (from your local machine)**
```bash
scp -P 54321 -r /home/maxjeffwell/GitHub_Projects/bookmarks-react-hooks/* maxjeffwell@192.168.50.142:~/apps/bookmarks/
```

### 4. Create Environment File

```bash
cp .env.example .env
nano .env  # or vi .env
```

Add your configuration:

```env
# Docker Compose Configuration
NODE_ENV=production
CLIENT_PORT=3000
SERVER_PORT=3001

# React App Configuration
REACT_APP_API_BASE_URL=/api

# Database Configuration (REQUIRED)
DATABASE_URL=postgresql://user:password@host.neon.tech/database?sslmode=require

# OpenAI Configuration (REQUIRED for AI features)
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
OPENAI_TEMPERATURE=0.3
OPENAI_MAX_TOKENS=500

# AI Feature Flags (Optional)
AI_FEATURES_ENABLED=true
AI_CACHE_ENABLED=true

# Local AI Configuration (recommended for NAS - uses shared AI gateway)
USE_LOCAL_AI=true
LOCAL_AI_URL=http://shared-ai-gateway:8002
```

**Note**: If you're using the shared AI gateway with other portfolio apps, make sure Bookmarked is on the same Docker network (`shared-infrastructure_app-network`).

Save and exit (Ctrl+X, then Y, then Enter in nano)

### 5. Start the Application

**Client Only (recommended):**
```bash
docker-compose up -d client
```

**With Backend Server (includes AI features):**
```bash
docker-compose --profile with-server up -d
```

### 6. Check Status

```bash
# View running containers
docker ps

# View logs
docker-compose logs -f

# Check specific service logs
docker-compose logs -f client
docker-compose logs -f server
```

### 7. Access the Application

- **Client**: `http://192.168.50.142:3000`
- **Server** (if running): `http://192.168.50.142:3001`

## Troubleshooting

### Run the Troubleshooting Script

```bash
chmod +x nas-troubleshoot.sh
./nas-troubleshoot.sh
```

### Common Issues

#### 1. Port Already in Use

**Error**: `Bind for 0.0.0.0:3000 failed: port is already allocated`

**Solution**: Change the port in `.env`:
```env
CLIENT_PORT=8080
SERVER_PORT=8081
```

Then restart:
```bash
docker-compose down
docker-compose up -d
```

#### 2. Database Connection Failed

**Error**: `Failed to connect to database`

**Solution**:
1. Verify your `DATABASE_URL` in `.env` is correct
2. Ensure it includes `?sslmode=require` at the end
3. Test connection:
```bash
docker exec bookmarks-server node -e "console.log(process.env.DATABASE_URL)"
```

#### 3. Containers Keep Restarting

**Check logs**:
```bash
docker logs bookmarks-client --tail 50
docker logs bookmarks-server --tail 50
```

**Common causes**:
- Missing environment variables
- Invalid DATABASE_URL
- Port conflicts
- Insufficient memory

#### 4. Build Fails

**Solution**: Rebuild without cache
```bash
docker-compose down
docker builder prune -a
docker-compose build --no-cache
docker-compose up -d
```

#### 5. AI Features Not Working

**Check**:
1. Server container is running: `docker ps | grep bookmarks-server`
2. OPENAI_API_KEY is set: `docker exec bookmarks-server env | grep OPENAI`
3. Server logs for errors: `docker logs bookmarks-server --tail 50`

**Test AI endpoint**:
```bash
curl -X POST http://192.168.50.142:3001/api/ai/tags \
  -H "Content-Type: application/json" \
  -d '{"bookmark": {"title": "Test", "url": "https://example.com", "description": "Test bookmark"}}'
```

## Updating the Application

### Pull Latest Changes

```bash
cd ~/apps/bookmarks
git pull origin master
```

### Rebuild and Restart

```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Or with server:
```bash
docker-compose down
docker-compose --profile with-server build --no-cache
docker-compose --profile with-server up -d
```

## Maintenance

### View Logs

```bash
# All services
docker-compose logs -f

# Last 100 lines
docker-compose logs --tail 100

# Specific service
docker-compose logs -f client
```

### Restart Services

```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart client
```

### Stop Services

```bash
# Stop all
docker-compose down

# Stop specific service
docker-compose stop client
```

### Clean Up

```bash
# Remove containers and networks
docker-compose down

# Remove containers, networks, and volumes
docker-compose down -v

# Remove all unused Docker data
docker system prune -a
```

## Performance Optimization

### Resource Limits

Add resource limits in `docker-compose.yml`:

```yaml
services:
  client:
    # ... existing config ...
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

### nginx Caching

The default `nginx.conf` already includes:
- Gzip compression
- 1-year caching for static assets
- Security headers

## Setting Up SSL/HTTPS

### Option 1: Reverse Proxy (Recommended)

Use your NAS's built-in reverse proxy:

**Synology DSM**:
1. Control Panel → Application Portal → Reverse Proxy
2. Create new rule:
   - Source: `bookmarks.yournas.com` (HTTPS 443)
   - Destination: `localhost:3000` (HTTP)

**QNAP**:
1. myQNAPcloud SSL Certificate
2. Virtual Host → Create rule

### Option 2: Caddy (Auto HTTPS)

```bash
# Install Caddy
docker run -d \
  --name caddy \
  -p 80:80 \
  -p 443:443 \
  -v caddy_data:/data \
  -v $PWD/Caddyfile:/etc/caddy/Caddyfile \
  caddy:latest
```

`Caddyfile`:
```
bookmarks.yourdomain.com {
    reverse_proxy bookmarks-client:80
}
```

## Backup Strategy

### Application Data

```bash
# Backup .env and docker-compose.yml
tar -czf bookmarks-backup-$(date +%Y%m%d).tar.gz .env docker-compose.yml
```

### Database

Your Neon database has automatic backups. For manual backups:

```bash
# Export database
docker exec bookmarks-server \
  pg_dump $DATABASE_URL > bookmarks-db-backup-$(date +%Y%m%d).sql
```

## Monitoring

### Health Checks

Both containers include health checks. View status:

```bash
docker inspect --format='{{.State.Health.Status}}' bookmarks-client
docker inspect --format='{{.State.Health.Status}}' bookmarks-server
```

### Resource Usage

```bash
# Real-time stats
docker stats bookmarks-client bookmarks-server

# Container info
docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

## Shared AI Infrastructure (Recommended for NAS)

If you're running multiple portfolio apps on your NAS (educationELLy, code-talk, IntervalAI, etc.), you can use a shared AI gateway instead of separate AI engines for each app.

### Benefits
- Single OpenVINO model in memory (saves resources)
- Consistent AI features across all apps
- Hybrid tag generation (instant keyword extraction + optional AI)
- Automatic failover and error handling

### Setup

1. **Deploy shared AI infrastructure** (if not already running):
```bash
# The shared AI gateway and portfolio AI engine containers should already be running
docker ps | grep -E "shared-ai-gateway|portfolio-ai-engine"
```

2. **Connect Bookmarked to shared network**:

Edit your `docker-compose.yml` to use the shared network:

```yaml
services:
  server:
    # ... existing config ...
    networks:
      - shared-infrastructure_app-network

networks:
  shared-infrastructure_app-network:
    external: true
```

3. **Verify configuration**:
```bash
# Check that USE_LOCAL_AI=true in .env
grep USE_LOCAL_AI .env

# Restart Bookmarked server
docker-compose restart server
```

4. **Test AI features**:
```bash
# Test tag generation through shared gateway
curl -X POST http://localhost:3001/api/ai/tags \
  -H "Content-Type: application/json" \
  -d '{"bookmark": {"title": "React Hooks Tutorial", "url": "https://example.com", "description": "Learn React hooks"}}'
```

### Network Architecture

```
Bookmarked Server
    ↓
Shared AI Gateway (Node.js, port 8002)
    ↓
Portfolio AI Engine (Python/OpenVINO, port 8001)
    ↓
TinyLlama-1.1B-INT8 Model
```

## Advanced Configuration

### Custom Domain

1. Set up DNS A record pointing to your NAS IP
2. Configure reverse proxy with SSL
3. Update `REACT_APP_API_BASE_URL` if needed

### Scaling

For multiple NAS instances, use Docker Swarm or external load balancer.

### Automated Backups

Create a cron job:

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * cd ~/apps/bookmarks && tar -czf ~/backups/bookmarks-$(date +\%Y\%m\%d).tar.gz .env docker-compose.yml
```

## Support

### Check Logs First

```bash
./nas-troubleshoot.sh
docker-compose logs -f
```

### Common Commands Reference

```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# Restart
docker-compose restart

# View logs
docker-compose logs -f

# Rebuild
docker-compose up -d --build

# Check status
docker ps

# Enter container
docker exec -it bookmarks-client sh
docker exec -it bookmarks-server sh
```

## Differences from Vercel Deployment

| Feature | Vercel | NAS Docker |
|---------|--------|------------|
| Hosting | Cloud (Automatic) | Self-hosted (Manual) |
| SSL | Automatic | Manual setup |
| Updates | Auto on git push | Manual rebuild |
| Scaling | Automatic | Manual/Limited |
| Control | Limited | Full control |
| Cost | Free tier + usage | Hardware/Power only |
| AI Features | Serverless functions | Express server |
| Database | Shared Neon | Shared Neon |

---

**Questions?** Check the [DOCKER.md](DOCKER.md) guide or open an issue on GitHub.
