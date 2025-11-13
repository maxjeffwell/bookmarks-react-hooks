# Quick Setup Guide for Bookmarked CI/CD

This guide will help you set up the CI/CD pipelines for Bookmarked in just a few steps.

## Prerequisites

- GitHub repository: `maxjeffwell/bookmarks-react-hooks`
- Docker Hub account: `maxjeffwell`
- Neon database already configured

## Step 1: Configure Docker Hub Access

### Create Docker Hub Access Token

1. Log in to [Docker Hub](https://hub.docker.com/)
2. Go to **Account Settings** → **Security**
3. Click **New Access Token**
4. Configure:
   - **Description**: `GitHub Actions Bookmarked`
   - **Access permissions**: `Read, Write, Delete`
5. Click **Generate**
6. **IMPORTANT:** Copy the token immediately (shown only once!)

### Add Secrets to GitHub

1. Go to your GitHub repository: https://github.com/maxjeffwell/bookmarks-react-hooks
2. Navigate to: **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**

Add these two secrets:

**Secret 1: DOCKERHUB_USERNAME**
- Name: `DOCKERHUB_USERNAME`
- Value: `maxjeffwell`

**Secret 2: DOCKERHUB_TOKEN**
- Name: `DOCKERHUB_TOKEN`
- Value: [paste the token you copied from Docker Hub]

## Step 2: Push Workflows to GitHub

```bash
cd /home/maxjeffwell/GitHub_Projects/bookmarks-react-hooks

# Check git status
git status

# Add workflow files
git add .github/workflows/ci.yml
git add .github/workflows/docker-build-push.yml

# Add documentation
git add CICD.md SETUP.md

# Add README changes (build badges)
git add README.md

# Commit
git commit -m "Add CI/CD workflows for automated Docker builds and testing"

# Push to GitHub
git push origin main
```

## Step 3: Verify Workflows

After pushing:

1. Go to **Actions** tab on GitHub
2. You should see workflows running:
   - ✅ **CI** - Testing and building
   - ✅ **Docker Build & Push** - Building and pushing TWO images (client + server)

3. Click on each workflow to see execution details

## Step 4: Check Docker Hub

After the Docker workflow completes:

1. **Client Image**: https://hub.docker.com/r/maxjeffwell/bookmarks-react-hooks-client
2. **Server Image**: https://hub.docker.com/r/maxjeffwell/bookmarks-react-hooks-server

You should see:
- `latest` tag on both
- `main` tag on both
- Build information

## What Happens Next?

### On Every Push to Any Branch

- **CI workflow** runs:
  - Tests the build
  - Runs linter
  - Runs tests
  - Verifies output files
  - Builds Docker image (doesn't push)
  - Tests the Docker container

### On Push to Main Branch

- **CI workflow** runs (tests)
- **Docker Build & Push** runs TWO jobs in parallel:

  **Job 1: Client Image**
  - Builds for multiple platforms (amd64, arm64)
  - Pushes to Docker Hub: `maxjeffwell/bookmarks-react-hooks-client`
  - Scans for security vulnerabilities

  **Job 2: Server Image**
  - Builds for multiple platforms (amd64, arm64)
  - Pushes to Docker Hub: `maxjeffwell/bookmarks-react-hooks-server`
  - Scans for security vulnerabilities

### On Creating Version Tags

```bash
# Create a release
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0

# Docker Build & Push creates multiple tags for BOTH images:
# Client:
# - maxjeffwell/bookmarks-react-hooks-client:v1.0.0
# - maxjeffwell/bookmarks-react-hooks-client:v1.0
# - maxjeffwell/bookmarks-react-hooks-client:v1
# - maxjeffwell/bookmarks-react-hooks-client:latest
#
# Server:
# - maxjeffwell/bookmarks-react-hooks-server:v1.0.0
# - maxjeffwell/bookmarks-react-hooks-server:v1.0
# - maxjeffwell/bookmarks-react-hooks-server:v1
# - maxjeffwell/bookmarks-react-hooks-server:latest
```

## Using the Published Docker Images

After workflows complete, you can pull and run your Docker images:

```bash
# Pull both images
docker pull maxjeffwell/bookmarks-react-hooks-client:latest
docker pull maxjeffwell/bookmarks-react-hooks-server:latest

# Or use docker-compose to pull and run everything
docker-compose pull
docker-compose up -d

# Access at: http://localhost:3000
```

## Viewing Build Status

Your README now has build status badges that show workflow status:

- ![CI](https://github.com/maxjeffwell/bookmarks-react-hooks/workflows/CI/badge.svg)
- ![Docker Build & Push](https://github.com/maxjeffwell/bookmarks-react-hooks/workflows/Docker%20Build%20%26%20Push/badge.svg)

## Troubleshooting

### Workflow Failed: Docker Build & Push

**Error: "Error: Cannot perform an interactive login from a non TTY device"**

This means Docker Hub credentials are missing or incorrect.

**Fix:**
1. Verify secrets exist in GitHub: `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN`
2. Regenerate Docker Hub token if needed
3. Update the GitHub secret

### Workflow Failed: CI

**Error: npm install fails**

**Fix:**
```bash
# Test locally first
cd /home/maxjeffwell/GitHub_Projects/bookmarks-react-hooks
npm install --legacy-peer-deps
npm run build
```

**Error: Tests fail**
- Tests are set to `continue-on-error: true`
- They won't block the build
- Review test failures in logs

### No Docker Images on Docker Hub

**Check:**
1. Workflow completed successfully (green checkmark)
2. You're looking at the correct Docker Hub repos:
   - https://hub.docker.com/r/maxjeffwell/bookmarks-react-hooks-client
   - https://hub.docker.com/r/maxjeffwell/bookmarks-react-hooks-server
3. Workflow ran on main/master branch (Docker push only happens on these branches)

### Client Built But Server Failed

- Client and server build independently
- Check the specific job that failed
- Server requires valid package.json in `server/` directory
- Verify server Dockerfile exists at `server/Dockerfile`

## Integration with Vercel

Your Vercel deployment continues to work alongside Docker:

### What Stays the Same

✅ Vercel deployment from GitHub (unchanged)
✅ Neon database (shared across all deployments)
✅ Vercel serverless functions (still work)

### What's New

🆕 Docker images for self-hosting
🆕 CI testing on every push
🆕 Multi-platform support (amd64, arm64)

### Deployment Options

You now have **multiple** deployment options:

1. **Vercel** (existing): Automatic on git push
2. **Docker Self-Hosted**: Pull images from Docker Hub
3. **Docker Cloud**: Deploy to AWS/GCP/Azure/etc.

All use the same Neon database!

## Security Notes

### Secrets Safety

✅ **Safe:**
- Secrets are encrypted in GitHub
- Only visible to workflow runners
- Not exposed in logs
- Can be rotated anytime

⚠️ **Never:**
- Commit secrets to git
- Share secrets publicly
- Use personal passwords (use tokens)

### Docker Hub Token

- Use access tokens, NOT your Docker Hub password
- Limit token scope to only what's needed
- Rotate tokens periodically
- Delete tokens you no longer use

## Next Steps

After setup:

1. **Test the pipeline:**
   ```bash
   # Make a small change
   echo "<!-- Test CI/CD -->" >> README.md
   git add README.md
   git commit -m "Test CI/CD pipeline"
   git push origin main
   ```

2. **Watch workflows run:**
   - Go to Actions tab
   - See both jobs execute (CI + Docker Build & Push)
   - Verify all pass

3. **Check deployments:**
   - Vercel: https://bookmarks-react-hooks.vercel.app/
   - Docker Hub Client: https://hub.docker.com/r/maxjeffwell/bookmarks-react-hooks-client
   - Docker Hub Server: https://hub.docker.com/r/maxjeffwell/bookmarks-react-hooks-server

4. **Test Docker images:**
   ```bash
   cd /home/maxjeffwell/GitHub_Projects/bookmarks-react-hooks
   docker-compose pull
   docker-compose up -d
   # Access at: http://localhost:3000
   ```

5. **Create first release:**
   ```bash
   git tag -a v1.0.0 -m "First release with CI/CD"
   git push origin v1.0.0
   # Creates versioned tags for both client and server images
   ```

## Documentation

For detailed information:

- **CI/CD Details**: See [CICD.md](CICD.md)
- **Docker Usage**: See [DOCKER.md](DOCKER.md)
- **Application Info**: See [README.md](README.md)

## Summary Checklist

- [ ] Created Docker Hub access token
- [ ] Added `DOCKERHUB_USERNAME` secret to GitHub
- [ ] Added `DOCKERHUB_TOKEN` secret to GitHub
- [ ] Pushed workflow files to GitHub
- [ ] Verified CI workflow runs successfully
- [ ] Verified Docker Build & Push workflow runs successfully
- [ ] Checked Docker Hub for both published images (client + server)
- [ ] Tested pulling and running Docker images locally with docker-compose
- [ ] Confirmed Vercel deployment still works

---

**You're all set!** Your Bookmarked application now has automated CI/CD pipelines. 🚀

Every push to main will:
1. Test and build your code (CI)
2. Create TWO Docker images (client + server)
3. Deploy to Vercel (existing workflow)

You have maximum deployment flexibility! 🎉
