export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).json({ 
    message: 'Debug endpoint working!',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url
  });
}