# Docker Deployment Guide

This guide explains how to deploy the Bookmarked application using Docker, alongside the existing Vercel deployment.

## Overview

The application can be deployed in two ways:
1. **Vercel** (existing deployment) - Serverless functions + static site
2. **Docker** (new option) - Containerized deployment with nginx

Both deployments share the same Neon PostgreSQL database, so your data remains consistent across all environments.

## Architecture

### Docker Setup
- **Client Container**: React app built and served with nginx
- **Server Container** (optional): Express API for local development
- **Database**: Shared Neon PostgreSQL database (same as Vercel)

### Why Docker?
- Self-hosting capability
- Local development environment
- Cloud deployment flexibility (AWS, GCP, Azure, Linode, etc.)
- Consistent environments across development and production

## Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- Neon database (already configured)

## Quick Start

### 1. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your Neon database credentials:

```env
DATABASE_URL=postgres://user:password@host.neon.tech/database?sslmode=require
```

### 2. Run with Docker Compose

**Client only (recommended for production):**

```bash
docker-compose up -d client
```

**With Express server (for local development):**

```bash
docker-compose --profile with-server up -d
```

### 3. Access the Application

- Client: http://localhost:3000
- Server (if running): http://localhost:3001

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `CLIENT_PORT` | Client port mapping | `3000` |
| `SERVER_PORT` | Server port mapping | `3001` |
| `REACT_APP_API_BASE_URL` | API endpoint for client | `/api` |
| `DATABASE_URL` | Neon PostgreSQL connection string | Required |

### Docker Compose Profiles

The setup uses Docker Compose profiles to control which services run:

- **Default**: Runs only the client container
- **with-server**: Runs both client and server containers

```bash
# Client only
docker-compose up -d

# Client + Server
docker-compose --profile with-server up -d
```

## Building Images

### Build Client Image

```bash
docker build -t bookmarks-client:latest .
```

### Build Server Image

```bash
docker build -t bookmarks-server:latest ./server
```

### Multi-stage Builds

The Dockerfiles use multi-stage builds with separate stages:

- **build**: Compiles the application
- **production**: Optimized runtime image
- **development**: Development with hot-reload

Build specific stages:

```bash
# Production build
docker build --target production -t bookmarks-client:prod .

# Development build
docker build --target development -t bookmarks-client:dev .
```

## Running Containers

### Using Docker Compose (Recommended)

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild and restart
docker-compose up -d --build
```

### Using Docker CLI

```bash
# Run client container
docker run -d \
  --name bookmarks-client \
  -p 3000:80 \
  -e REACT_APP_API_BASE_URL=/api \
  bookmarks-client:latest

# Run server container
docker run -d \
  --name bookmarks-server \
  -p 3001:3001 \
  -e DATABASE_URL="your_connection_string" \
  bookmarks-server:latest
```

## Deployment Scenarios

### Local Development

Use the development stage with hot-reload:

```bash
docker-compose -f docker-compose.yml --profile with-server up
```

### Production Self-Hosting

1. Build production images:
```bash
docker-compose build
```

2. Deploy to your server:
```bash
docker-compose up -d
```

3. Set up reverse proxy (nginx, Caddy, Traefik) for HTTPS

### Cloud Deployment

**Docker Hub:**
```bash
# Tag and push images
docker tag bookmarks-client:latest username/bookmarks-client:latest
docker push username/bookmarks-client:latest
```

**Container Registries:**
- AWS ECR
- Google Container Registry (GCR)
- Azure Container Registry (ACR)
- GitHub Container Registry (GHCR)

## Data Management

### Database

The Docker deployment uses your existing Neon PostgreSQL database:
- No separate database container needed
- Same database as Vercel deployment
- Data is centralized and consistent
- Automatic connection pooling via Neon

### Backups

Neon provides automatic backups. For additional backups:

```bash
# Export data via pg_dump (if needed)
docker exec bookmarks-server \
  pg_dump $DATABASE_URL > backup.sql
```

## Monitoring and Maintenance

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f client
docker-compose logs -f server
```

### Health Checks

Both containers include health checks:

```bash
# Check container health
docker ps

# Inspect health status
docker inspect --format='{{.State.Health.Status}}' bookmarks-client
```

### Resource Usage

```bash
# Monitor resource usage
docker stats

# Specific containers
docker stats bookmarks-client bookmarks-server
```

## Troubleshooting

### Build Failures

**Issue**: npm install fails
```bash
# Clear Docker cache
docker builder prune -a

# Rebuild without cache
docker-compose build --no-cache
```

**Issue**: Port already in use
```bash
# Change port in .env file
CLIENT_PORT=8080
SERVER_PORT=8081
```

### Runtime Issues

**Issue**: Cannot connect to database
```bash
# Verify DATABASE_URL in .env
# Check Neon database is accessible
# Ensure connection string includes ?sslmode=require
```

**Issue**: 502 Bad Gateway
```bash
# Check nginx logs
docker logs bookmarks-client

# Verify build folder exists
docker exec bookmarks-client ls /usr/share/nginx/html
```

## Performance Optimization

### nginx Configuration

The included `nginx.conf` is optimized with:
- Gzip compression
- Static asset caching (1 year)
- Security headers
- Connection pooling

### Multi-platform Builds

Build for multiple architectures:

```bash
# Setup buildx
docker buildx create --use

# Build for multiple platforms
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t bookmarks-client:latest \
  --push .
```

## Security

### Best Practices

- ✅ Non-root user in containers
- ✅ Security headers configured
- ✅ .env file excluded from git
- ✅ Minimal base images (Alpine Linux)
- ✅ Multi-stage builds (smaller images)

### SSL/TLS

For production, use a reverse proxy with SSL:

**nginx:**
```nginx
server {
    listen 443 ssl http2;
    server_name bookmarks.yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
    }
}
```

**Caddy** (automatic HTTPS):
```
bookmarks.yourdomain.com {
    reverse_proxy localhost:3000
}
```

## Comparison: Docker vs Vercel

| Feature | Vercel | Docker |
|---------|--------|--------|
| **Hosting** | Managed platform | Self-hosted or cloud |
| **Scaling** | Automatic | Manual or orchestration |
| **Cost** | Free tier + usage | Infrastructure cost |
| **Setup** | Simple (git push) | Requires Docker setup |
| **Database** | Same Neon DB | Same Neon DB |
| **SSL** | Automatic | Manual setup required |
| **CI/CD** | Built-in | Custom (GitHub Actions, etc.) |
| **Flexibility** | Limited | Full control |

## Coexistence with Vercel

The Docker setup coexists peacefully with Vercel:

1. **Database**: Both use the same Neon database
2. **Code**: Vercel deploys from git, Docker from local build
3. **API**: Vercel uses serverless functions, Docker uses Express (optional)
4. **No Conflicts**: Different deployments, same codebase

You can:
- Keep Vercel as production deployment
- Use Docker for local development
- Use Docker for self-hosted backup deployment
- Switch between them anytime

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/)
- [nginx Documentation](https://nginx.org/en/docs/)
- [Neon Documentation](https://neon.tech/docs/)

## Support

For issues specific to:
- **Docker setup**: Check this guide and Docker logs
- **Application**: See main [README.md](README.md)
- **Vercel deployment**: Check Vercel dashboard

---

**Note**: The Docker configuration files (Dockerfile, docker-compose.yml, nginx.conf) are gitignored to avoid conflicts with Vercel deployment. Keep these files locally for your Docker deployments.
