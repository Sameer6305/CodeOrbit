export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  return res.status(200).json({ 
    status: 'working',
    message: 'API routes are functional',
    timestamp: new Date().toISOString(),
    query: req.query
  });
}
