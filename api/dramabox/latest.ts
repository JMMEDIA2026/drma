export default async function handler(req: any, res: any) {
  const lang = (req.query.lang as string) || 'ko';

  try {
    const response = await fetch(`https://puruboy-api.vercel.app/api/dramabox/home`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36',
        Accept: 'application/json',
      },
    });
    if (response.ok) {
      const data = await response.json();
      return res.status(200).json({ success: true, data: data.data || data, source: 'puruboy-home' });
    }
  } catch (e) {
    // fallback below
  }

  try {
    const response = await fetch(`https://api.sansekai.my.id/api/dramabox/latest?lang=${encodeURIComponent(lang)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36',
        Accept: 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    const data = await response.json();
    return res.status(200).json({ success: true, data, source: 'live' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Failed to fetch from DramaBox API' });
  }
}
