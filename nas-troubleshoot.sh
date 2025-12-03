#!/bin/bash
# NAS Deployment Troubleshooting Script
# Run this on your NAS to diagnose deployment issues

echo "========================================="
echo "Bookmarks App - NAS Troubleshooting"
echo "========================================="
echo ""

# Check Docker installation
echo "1. Checking Docker..."
if command -v docker &> /dev/null; then
    echo "   ✓ Docker installed: $(docker --version)"
else
    echo "   ✗ Docker not installed"
    exit 1
fi

# Check Docker Compose
echo ""
echo "2. Checking Docker Compose..."
if command -v docker-compose &> /dev/null; then
    echo "   ✓ Docker Compose installed: $(docker-compose --version)"
else
    echo "   ✗ Docker Compose not installed"
    exit 1
fi

# Check if containers are running
echo ""
echo "3. Checking running containers..."
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Check if bookmarks containers exist (running or stopped)
echo ""
echo "4. Checking bookmarks containers..."
CONTAINERS=$(docker ps -a --filter "name=bookmarks" --format "{{.Names}}")
if [ -z "$CONTAINERS" ]; then
    echo "   ✗ No bookmarks containers found"
else
    echo "   Containers found:"
    docker ps -a --filter "name=bookmarks" --format "   - {{.Names}}: {{.Status}}"
fi

# Check environment file
echo ""
echo "5. Checking environment configuration..."
if [ -f ".env" ]; then
    echo "   ✓ .env file exists"
    echo "   Environment variables (sensitive values hidden):"
    grep -v "^#" .env | grep -v "^$" | sed 's/=.*/=***/' | sed 's/^/   /'
else
    echo "   ✗ .env file not found"
    echo "   Create it from .env.example: cp .env.example .env"
fi

# Check container logs
echo ""
echo "6. Recent container logs..."
if docker ps -a --filter "name=bookmarks-client" --format "{{.Names}}" | grep -q "bookmarks-client"; then
    echo "   Client logs (last 10 lines):"
    docker logs bookmarks-client --tail 10 2>&1 | sed 's/^/   /'
fi

if docker ps -a --filter "name=bookmarks-server" --format "{{.Names}}" | grep -q "bookmarks-server"; then
    echo ""
    echo "   Server logs (last 10 lines):"
    docker logs bookmarks-server --tail 10 2>&1 | sed 's/^/   /'
fi

# Check port availability
echo ""
echo "7. Checking port availability..."
for port in 3000 3001 80; do
    if netstat -tuln 2>/dev/null | grep -q ":$port "; then
        echo "   Port $port: IN USE"
    else
        echo "   Port $port: Available"
    fi
done

# Check network
echo ""
echo "8. Checking Docker networks..."
docker network ls | grep bookmarks || echo "   No bookmarks network found"

# Suggest next steps
echo ""
echo "========================================="
echo "Suggested Actions:"
echo "========================================="

if [ ! -f ".env" ]; then
    echo "1. Create .env file with your database credentials"
fi

if [ -z "$CONTAINERS" ]; then
    echo "2. Start containers: docker-compose up -d"
else
    RUNNING=$(docker ps --filter "name=bookmarks" --format "{{.Names}}")
    if [ -z "$RUNNING" ]; then
        echo "2. Containers exist but not running. Restart: docker-compose up -d"
    fi
fi

echo "3. View live logs: docker-compose logs -f"
echo "4. Rebuild if needed: docker-compose up -d --build"
echo ""
