import { neon } from '@neondatabase/serverless';

const AI_GATEWAY_URL = process.env.AI_GATEWAY_URL || 'http://shared-ai-gateway:8002';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { bookmarkId, title, url, existingDescription, save = false } = req.body;

    // Validate input
    if (!title || !url) {
      return res.status(400).json({
        error: 'Title and URL required',
        message: 'Provide title and url in the request body'
      });
    }

    console.log(`Generating description for: ${title.substring(0, 50)}...`);

    // Call the gateway's describe endpoint
    const response = await fetch(`${AI_GATEWAY_URL}/api/ai/describe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        url,
        existingDescription
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gateway error: ${response.status} - ${error}`);
    }

    const data = await response.json();

    // Optionally save to database
    if (save && bookmarkId && process.env.DATABASE_URL) {
      try {
        const sql = neon(process.env.DATABASE_URL);
        await sql`
          UPDATE bookmarks
          SET description = ${data.description}
          WHERE id = ${bookmarkId}
        `;
        data.saved = true;
      } catch (dbError) {
        console.error('Failed to save description:', dbError);
        data.saved = false;
        data.saveError = dbError.message;
      }
    }

    return res.status(200).json({
      success: true,
      description: data.description,
      title,
      url,
      model: data.model,
      backend: data.backend,
      saved: data.saved || false
    });

  } catch (error) {
    console.error('Description generation error:', error);

    if (error.message?.includes('ECONNREFUSED')) {
      return res.status(503).json({
        error: 'AI Gateway unavailable',
        message: 'Cannot connect to AI service. Check AI_GATEWAY_URL.'
      });
    }

    // Fallback: generate simple description from title
    const fallbackDesc = `Resource about ${req.body.title || 'this topic'}.`;

    return res.status(200).json({
      success: true,
      description: fallbackDesc,
      title: req.body.title,
      url: req.body.url,
      method: 'fallback',
      warning: error.message
    });
  }
}
