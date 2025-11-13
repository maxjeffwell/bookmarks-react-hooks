# CI/CD Pipeline Documentation for Bookmarked

This guide explains the Continuous Integration and Continuous Deployment (CI/CD) pipelines configured for the Bookmarked application using GitHub Actions.

## Overview

The project includes two automated workflows:

1. **CI (Continuous Integration)** - Tests and validates every push/PR
2. **Docker Build & Push** - Builds and publishes Docker images to Docker Hub (client and server)

## Workflows

### 1. CI Workflow (`ci.yml`)

**Triggers:**
- Push to `master`, `main`, or `develop` branches
- Pull requests to `master`, `main`, or `develop` branches

**Jobs:**
- Runs on multiple Node.js versions (18.x, 20.x)
- Installs dependencies with `--legacy-peer-deps`
- Runs linter (non-blocking)
- Runs tests (non-blocking)
- Builds the project
- Verifies build output (checks for required files)
- Builds Docker image (without pushing)
- Tests Docker container by running it and making HTTP request

**Status Badge:**
```markdown
![CI](https://github.com/maxjeffwell/bookmarks-react-hooks/workflows/CI/badge.svg)
```

### 2. Docker Build & Push Workflow (`docker-build-push.yml`)

**Triggers:**
- Push to `master` or `main` branch
- Git tags matching `v*` (e.g., v1.0.0)
- Manual trigger via workflow_dispatch

**Features:**
- **Builds TWO Docker images**: Client and Server
- Multi-platform builds (linux/amd64, linux/arm64)
- Automatic tagging based on branch/tag
- Docker Hub integration
- Security scanning with Trivy (separate scans for client and server)
- Layer caching for faster builds
- SARIF upload to GitHub Security tab

**Images Published:**
1. **Client**: `maxjeffwell/bookmarks-react-hooks-client`
2. **Server**: `maxjeffwell/bookmarks-react-hooks-server`

**Image Tags Generated:**
- `latest` - for default branch pushes
- `main` or `master` - branch name
- `v1.0.0` - semantic version tags
- `v1.0` - major.minor version
- `v1` - major version
- `main-abc123` - branch-commit hash

**Status Badge:**
```markdown
![Docker Build & Push](https://github.com/maxjeffwell/bookmarks-react-hooks/workflows/Docker%20Build%20%26%20Push/badge.svg)
```

## Required GitHub Secrets

You need to configure the following secrets in your GitHub repository:

### Setting Up Secrets

Go to: **GitHub Repository** → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

### 1. Docker Hub Credentials

**`DOCKERHUB_USERNAME`**
- Your Docker Hub username
- Example: `maxjeffwell`

**`DOCKERHUB_TOKEN`**
- Docker Hub access token (NOT your password)
- Create at: https://hub.docker.com/settings/security
- Steps:
  1. Log in to Docker Hub
  2. Go to **Account Settings** → **Security**
  3. Click **New Access Token**
  4. Name: `GitHub Actions Bookmarks`
  5. Permissions: **Read, Write, Delete**
  6. Copy the token (shown only once!)
  7. Add to GitHub Secrets

### 2. GitHub Token (Automatic)

**`GITHUB_TOKEN`**
- Automatically provided by GitHub Actions
- No manual configuration needed
- Used for uploading security scan results

## Workflow Permissions

The workflows require specific permissions configured in the YAML files:

```yaml
permissions:
  contents: read        # Read repository contents
  packages: write       # Push Docker images
  security-events: write # Upload security scan results
```

## Setting Up CI/CD

### Initial Setup

1. **Add Docker Hub secrets:**
```bash
# On GitHub:
# Settings → Secrets → Actions → New repository secret
# Add: DOCKERHUB_USERNAME
# Add: DOCKERHUB_TOKEN
```

2. **Push workflows to GitHub:**
```bash
cd /home/maxjeffwell/GitHub_Projects/bookmarks-react-hooks

# Add workflow files
git add .github/workflows/

# Commit
git commit -m "Add CI/CD workflows with GitHub Actions"

# Push
git push origin main
```

### Verifying Setup

After pushing the workflows:

1. Go to **Actions** tab on GitHub
2. You should see two workflows:
   - ✅ CI
   - ✅ Docker Build & Push

3. Click on any workflow to see execution details

## Triggering Workflows

### Automatic Triggers

**CI Workflow:**
- Automatically runs on every push to main/master/develop
- Automatically runs on every pull request

**Docker Build & Push:**
- Automatically runs on push to main/master
- Automatically runs on version tags (v1.0.0)

### Manual Triggers

All workflows can be manually triggered:

1. Go to **Actions** tab
2. Select the workflow
3. Click **Run workflow**
4. Choose the branch
5. Click **Run workflow** button

Or via GitHub CLI:

```bash
# Trigger CI workflow
gh workflow run ci.yml

# Trigger Docker build
gh workflow run docker-build-push.yml
```

## Workflow Execution Flow

### Push to Feature Branch

```
1. Developer pushes to feature branch
2. CI workflow runs:
   ✓ Install dependencies
   ✓ Run linter
   ✓ Run tests
   ✓ Build project
   ✓ Verify build output
   ✓ Build Docker image
   ✓ Test Docker container
3. CI badge shows status
```

### Push to Main Branch

```
1. Developer merges to main
2. CI workflow runs (tests)
3. Docker Build & Push runs:
   Job 1: Client Image
   ✓ Build multi-platform client image
   ✓ Push to Docker Hub (maxjeffwell/bookmarks-react-hooks-client:latest)
   ✓ Run security scan
   ✓ Upload scan results

   Job 2: Server Image
   ✓ Build multi-platform server image
   ✓ Push to Docker Hub (maxjeffwell/bookmarks-react-hooks-server:latest)
   ✓ Run security scan
   ✓ Upload scan results
4. All badges show ✓ passing
```

### Creating Release Tag

```bash
# Create and push version tag
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0

# Docker Build & Push runs:
# Creates images with tags:
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

## Monitoring Workflows

### GitHub Actions UI

1. Go to repository **Actions** tab
2. View workflow runs (success/failure)
3. Click on run to see detailed logs
4. Download artifacts if any

### Email Notifications

GitHub sends email notifications on:
- Workflow failures
- First workflow success after previous failures

Configure at: **Profile** → **Settings** → **Notifications**

### Status Badges

Add to README.md to show workflow status:

```markdown
![CI](https://github.com/maxjeffwell/bookmarks-react-hooks/workflows/CI/badge.svg)
![Docker Build & Push](https://github.com/maxjeffwell/bookmarks-react-hooks/workflows/Docker%20Build%20%26%20Push/badge.svg)
```

## Docker Hub Integration

### Accessing Published Images

Images are published to Docker Hub:

```bash
# Pull client image
docker pull maxjeffwell/bookmarks-react-hooks-client:latest

# Pull server image
docker pull maxjeffwell/bookmarks-react-hooks-server:latest

# Pull specific version
docker pull maxjeffwell/bookmarks-react-hooks-client:v1.0.0

# Run full stack locally
docker-compose pull
docker-compose up -d
```

### Viewing on Docker Hub

**Client**: https://hub.docker.com/r/maxjeffwell/bookmarks-react-hooks-client
**Server**: https://hub.docker.com/r/maxjeffwell/bookmarks-react-hooks-server

- View available tags
- See image sizes
- Check build dates
- View pull statistics

## Security Scanning

### Trivy Scanner

The Docker Build & Push workflow includes Trivy security scanning for both images:

- Scans Docker images for vulnerabilities
- Checks for CVEs in:
  - OS packages (Alpine Linux)
  - npm dependencies
  - Application code
- Uploads results to GitHub Security tab (separate categories)

### Viewing Security Results

1. Go to repository **Security** tab
2. Click **Code scanning alerts**
3. Filter by **Trivy** and category (client or server)
4. Review and dismiss/fix vulnerabilities

### Security Scan Behavior

- Runs after Docker images are built
- Does NOT block deployment (continue-on-error: true)
- Provides visibility into security issues
- Recommended to review regularly

## Troubleshooting

### CI Workflow Failures

**Issue: npm install fails**
```bash
# Check locally first
cd /home/maxjeffwell/GitHub_Projects/bookmarks-react-hooks
npm install --legacy-peer-deps

# If works locally, check GitHub Actions logs
```

**Issue: Build fails**
```bash
# Test build locally
npm run build

# Check for missing environment variables
# Verify REACT_APP_API_BASE_URL is set in workflow
```

**Issue: Docker build fails**
```bash
# Test Docker build locally
docker build -t bookmarks-client:test .

# Check .dockerignore
# Verify all required files are copied
```

### Docker Build & Push Failures

**Issue: Authentication failed**
- Verify `DOCKERHUB_USERNAME` is correct
- Regenerate `DOCKERHUB_TOKEN` on Docker Hub
- Update GitHub secret

**Issue: Push denied**
- Check Docker Hub repositories exist
- Verify token has write permissions
- Ensure repositories are not private (or token has access)

**Issue: Multi-platform build fails**
- QEMU setup issue (usually transient)
- Retry the workflow
- Check GitHub Actions status page

**Issue: One image builds but other fails**
- Client and server build independently
- Check specific job logs
- Server requires valid package.json in server/ directory

## Integration with Vercel

### Coexistence

The CI/CD workflows coexist with Vercel deployment:

1. **Vercel Deployment**: Continues to work from GitHub pushes
2. **Docker Images**: Built in parallel for self-hosting option
3. **Same Neon Database**: All deployments use same PostgreSQL database
4. **No Conflicts**: Different hosting methods, same codebase

### Workflow Comparison

| Deployment | Trigger | Output |
|------------|---------|--------|
| **Vercel** | Push to main | Live site on Vercel |
| **Docker** | Push to main | Images on Docker Hub |
| **Both** | Can run simultaneously | Multiple deployment options |

## Best Practices

### Branch Protection

Protect main branch:
1. Go to **Settings** → **Branches**
2. Add rule for `main`
3. Enable:
   - Require status checks (CI must pass)
   - Require pull request reviews
   - Require branches to be up to date

### Semantic Versioning

Use semantic versioning for releases:

```bash
# Major version (breaking changes)
git tag -a v2.0.0 -m "Breaking: New authentication system"

# Minor version (new features)
git tag -a v1.1.0 -m "Add bookmark export feature"

# Patch version (bug fixes)
git tag -a v1.0.1 -m "Fix: Bookmark delete button"

# Push tags
git push origin --tags
```

### Workflow Optimization

**Speed up builds:**
- Use dependency caching (already configured)
- Use Docker layer caching (already configured)
- Run client and server builds in parallel (already configured)

**Reduce costs:**
- Limit workflow runs (only on main/master for Docker push)
- Use `continue-on-error` for non-critical steps
- Set timeouts for long-running jobs

## Maintenance

### Regular Tasks

**Weekly:**
- Review security scan results for both images
- Check for failed workflows
- Monitor Docker Hub storage usage

**Monthly:**
- Update GitHub Actions versions
- Rotate secrets if needed
- Review and prune old Docker images

**Quarterly:**
- Update Node.js versions in CI matrix
- Review and update dependencies
- Audit GitHub Actions permissions

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Build & Push Action](https://github.com/docker/build-push-action)
- [Trivy Scanner](https://github.com/aquasecurity/trivy)
- [Main README](README.md)
- [Docker Guide](DOCKER.md)

## Support

For issues with:
- **Workflows**: Check GitHub Actions logs and this documentation
- **Docker**: See [DOCKER.md](DOCKER.md)
- **Vercel**: Check Vercel dashboard

---

**Bookmarked CI/CD** - Automated builds, dual Docker images, continuous delivery
