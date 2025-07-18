import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  // Only allow GET requests for safety
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const sql = neon(process.env.DATABASE_URL);
    
    // Drop the comments table
    await sql`DROP TABLE IF EXISTS comments`;
    
    res.status(200).json({ 
      message: 'Comments table dropped successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error dropping table:', error);
    res.status(500).json({ error: 'Failed to drop table', details: error.message });
  }
}