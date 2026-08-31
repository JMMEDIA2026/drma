import { getDb } from './_lib/db';
import { transformMovieBoxItems } from '../src/data/koreaMovies';

// Serves the '한국' tab. The MovieBox source is unreliable (aggressive
// rate limiting, IP-blacklisting observed in testing), so this tries the
// live API first and opportunistically refreshes a MongoDB cache on
// success; when the live call fails or returns nothing, it falls back to
// whatever was last cached instead of showing an empty tab.
export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  let collection;
  try {
    const db = await getDb();
    collection = db.collection('korea_movies');
  } catch (e) {
    collection = null;
  }

  try {
    const page = req.query?.page || '1';
    const liveRes = await fetch(`https://api.sansekai.my.id/api/moviebox/k-drama?page=${page}`, {
      headers: { Accept: '*/*' },
    });
    const liveData = await liveRes.json();
    const items = liveData?.data?.items;

    if (Array.isArray(items) && items.length > 0) {
      const transformed = transformMovieBoxItems(items);
      if (collection) {
        collection
          .updateOne(
            { _id: 'cache' as any },
            { $set: { value: transformed, updatedAt: new Date().toISOString() } },
            { upsert: true }
          )
          .catch((err: any) => console.error('Failed to refresh korea_movies cache:', err.message));
      }
      return res.status(200).json({ source: 'live', items: transformed });
    }
  } catch (e) {
    // Live fetch failed — fall through to cache below.
  }

  if (!collection) {
    return res.status(200).json({ source: 'none', items: [] });
  }

  try {
    const doc = await collection.findOne({ _id: 'cache' as any });
    return res.status(200).json({ source: doc?.value?.length ? 'cache' : 'none', items: doc?.value || [] });
  } catch (e: any) {
    return res.status(200).json({ source: 'none', items: [], error: e.message });
  }
}
