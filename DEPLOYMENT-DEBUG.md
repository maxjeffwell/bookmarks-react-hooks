# Deployment Debugging Guide

## AI Tag Generation Errors

If you're getting "Failed to generate tags" errors in production, follow these steps:

### 1. Check Browser Console

Open your browser's developer console (F12) when the error occurs. You should see detailed logs like:

```
Failed to generate tags: Error: ...
Error response: { error: "...", message: "..." }
Error status: 500
```

### 2. Common Error Messages and Solutions

| Error Message | Status Code | Solution |
|---------------|-------------|----------|
| "DATABASE_URL environment variable is missing" | 500 | Add `DATABASE_URL` to Vercel environment variables |
| "OpenAI API key not configured" | 503 | Add `OPENAI_API_KEY` to Vercel environment variables |
| "OpenAI API key is invalid or missing" | 401 | Check your OpenAI API key is valid and has credits |
| "Rate limit exceeded" | 429 | Wait a moment, or upgrade your OpenAI plan |
| "Network error. Cannot reach the server" | - | Check your internet connection or Vercel deployment status |

### 3. Check Vercel Function Logs

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: `bookmarks-react-hooks`
3. Click on "Deployments" tab
4. Click on the latest deployment
5. Click on "Functions" tab
6. Look for `/api/ai/tags` function
7. Check the runtime logs for detailed error messages

### 4. Required Environment Variables

Make sure these are set in Vercel:

#### Required
```bash
DATABASE_URL=postgresql://user:password@host.neon.tech/database?sslmode=require
OPENAI_API_KEY=sk-...
```

#### Optional (but recommended)
```bash
OPENAI_MODEL=gpt-4o-mini
OPENAI_TEMPERATURE=0.3
OPENAI_MAX_TOKENS=500
AI_CACHE_ENABLED=true
```

### 5. How to Add Environment Variables in Vercel

1. Go to your project in Vercel
2. Click "Settings"
3. Click "Environment Variables"
4. Add each variable:
   - Variable Name: `DATABASE_URL`
   - Value: Your Neon database connection string
   - Environment: Production (or All)
5. Click "Save"
6. **Important**: Redeploy your application after adding variables

### 6. Test the API Directly

You can test the API endpoint directly from your terminal:

```bash
curl -X POST https://bookmarks-react-hooks.vercel.app/api/ai/tags \
  -H "Content-Type: application/json" \
  -d '{
    "bookmark": {
      "title": "Test Bookmark",
      "url": "https://example.com",
      "description": "This is a test"
    }
  }'
```

Expected success response:
```json
{
  "success": true,
  "tags": ["test", "example", "demo"],
  "message": "Generated 3 tags successfully"
}
```

Expected error response (missing env vars):
```json
{
  "error": "Database not configured",
  "message": "DATABASE_URL environment variable is missing. Please configure it in Vercel settings."
}
```

### 7. Verify OpenAI API Key

Test your OpenAI API key directly:

```bash
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer YOUR_OPENAI_API_KEY"
```

If this fails, your API key is invalid or expired.

### 8. Check Database Connection

Test your Neon database connection:

```bash
# Install psql if you don't have it
# Then connect to your database
psql "postgresql://user:password@host.neon.tech/database?sslmode=require"
```

If this fails, your DATABASE_URL is incorrect.

### 9. Still Having Issues?

1. Check that all dependencies are installed (check `package.json`)
2. Verify your Vercel build logs for any errors
3. Make sure you redeployed after adding environment variables
4. Check your OpenAI account has available credits
5. Verify your Neon database is active and accessible

### 10. Local Testing

To test locally before deploying:

```bash
# Create .env file with your variables
cp .env.example .env
# Edit .env and add your actual keys

# Install dependencies
npm install

# Start development server
npm start
```

Then test the tag generation feature locally to verify it works before deploying.
