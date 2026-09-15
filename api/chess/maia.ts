export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const { notasi } = req.body || {};
  if (!Array.isArray(notasi) || !notasi.every((move) => typeof move === 'string' && move.trim())) {
    return res.status(400).json({ error: 'invalid_request', message: '`notasi` must be a non-empty array of UCI move strings.' });
  }

  try {
    const response = await fetch('https://api.jmweb.website/api/chess/maia', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'User-Agent': 'Mozilla/5.0',
      },
      body: JSON.stringify({ notasi }),
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err: any) {
    return res.status(500).json({ error: 'proxy_failed', message: err.message || 'Failed to reach Maia Chess API.' });
  }
}
