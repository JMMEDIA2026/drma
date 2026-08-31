// Proxies the MovieBox K-drama listing API (a separate catalog source
// from the DramaBox proxy — Korean movies/dramas, browse-only: this
// source doesn't provide playable video URLs, only metadata/covers).
export default async function handler(req: any, res: any) {
  try {
    const queryString = new URLSearchParams(req.query as Record<string, string>).toString();
    const url = `https://api.sansekai.my.id/api/moviebox/k-drama${queryString ? `?${queryString}` : ''}`;
    const response = await fetch(url, {
      headers: { Accept: '*/*' },
    });
    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err: any) {
    return res.status(500).json({ code: -1, message: err.message });
  }
}
