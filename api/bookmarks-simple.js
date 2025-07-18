export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  if (req.method === 'GET') {
    // Return mock data for now
    res.status(200).json([
      {
        id: '1',
        title: 'Test Bookmark',
        url: 'https://example.com',
        description: 'A test bookmark',
        rating: '5 stars',
        toggledRadioButton: false,
        checked: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]);
  } else if (req.method === 'POST') {
    const { title, url, description, rating } = req.body;
    
    // Return mock created bookmark
    res.status(201).json({
      id: Date.now().toString(),
      title: title || 'New Bookmark',
      url: url || 'https://example.com',
      description: description || '',
      rating: rating || '',
      toggledRadioButton: false,
      checked: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}