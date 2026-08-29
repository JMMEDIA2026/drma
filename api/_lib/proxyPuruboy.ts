export async function proxyPuruboy(endpoint: string, req: any, res: any) {
  try {
    const queryString = new URLSearchParams(req.query as Record<string, string>).toString();
    const url = `https://puruboy-api.vercel.app${endpoint}${queryString ? `?${queryString}` : ''}`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'application/json' },
    });
    const data = await response.json();
    return res.status(200).json(data);
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
