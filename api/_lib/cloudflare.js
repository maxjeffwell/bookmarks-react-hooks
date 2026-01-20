// Cloudflare cache purge utility for Vercel API routes

const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const CLOUDFLARE_ZONE_ID = process.env.CLOUDFLARE_ZONE_ID;
const CACHE_INVALIDATION_API_KEY = process.env.CACHE_INVALIDATION_API_KEY;

// Both deployment URLs that need cache purging
const DEPLOYMENT_URLS = [
  'https://bookmarked-k8s.el-jefe.me',
  'https://bookmarks-react-hooks.vercel.app'
];

const K8S_API_URL = 'https://bookmarked-k8s.el-jefe.me';

export async function purgeCache(urls) {
  if (!CLOUDFLARE_API_TOKEN || !CLOUDFLARE_ZONE_ID) {
    console.log('Cloudflare credentials not configured, skipping cache purge');
    return { success: false, reason: 'not_configured' };
  }

  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/purge_cache`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          files: Array.isArray(urls) ? urls : [urls],
        }),
      }
    );

    const result = await response.json();

    if (result.success) {
      console.log('Cloudflare cache purged:', urls);
      return { success: true };
    } else {
      console.error('Cloudflare cache purge failed:', result.errors);
      return { success: false, errors: result.errors };
    }
  } catch (error) {
    console.error('Cloudflare cache purge error:', error.message);
    return { success: false, error: error.message };
  }
}

// Invalidate Redis cache on K8s server
async function invalidateK8sRedisCache() {
  if (!CACHE_INVALIDATION_API_KEY) {
    console.log('CACHE_INVALIDATION_API_KEY not configured, skipping K8s Redis invalidation');
    return { success: false, reason: 'not_configured' };
  }

  try {
    const response = await fetch(`${K8S_API_URL}/api/cache/invalidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-cache-api-key': CACHE_INVALIDATION_API_KEY,
      },
    });

    const result = await response.json();

    if (response.ok) {
      console.log('K8s Redis cache invalidated');
      return { success: true };
    } else {
      console.error('K8s Redis cache invalidation failed:', result.error);
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error('K8s Redis cache invalidation error:', error.message);
    return { success: false, error: error.message };
  }
}

export async function purgeBookmarksCache() {
  // Purge Cloudflare cache for both deployments
  const urls = DEPLOYMENT_URLS.map(baseUrl => `${baseUrl}/api/bookmarks`);
  const cloudflareResult = await purgeCache(urls);

  // Also invalidate K8s Redis cache
  const redisResult = await invalidateK8sRedisCache();

  return {
    cloudflare: cloudflareResult,
    redis: redisResult,
    success: cloudflareResult.success || redisResult.success
  };
}
