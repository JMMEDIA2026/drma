import { getDb } from '../_lib/db';

// Shared admin config (ad slots, drama badge/delete overrides) stored in
// MongoDB so every visitor sees the same state, instead of each browser's
// own localStorage. Reads are public; writes require the ADMIN_API_SECRET
// header so random visitors can't overwrite it.
export default async function handler(req: any, res: any) {
  let collection;
  try {
    const db = await getDb();
    collection = db.collection('app_settings');
  } catch (err: any) {
    return res.status(500).json({ error: 'db_unavailable', message: err.message });
  }

  try {
    if (req.method === 'GET') {
      const docs = await collection.find({ _id: { $in: ['ad_slots', 'drama_overrides'] as any } }).toArray();
      const result: { adSlots: any; dramaOverrides: any } = { adSlots: null, dramaOverrides: {} };
      for (const doc of docs) {
        if (doc._id === 'ad_slots') result.adSlots = doc.value;
        if (doc._id === 'drama_overrides') result.dramaOverrides = doc.value;
      }
      return res.status(200).json(result);
    }

    if (req.method === 'POST' || req.method === 'PUT') {
      const providedSecret = req.headers['x-admin-secret'];
      const expectedSecret = process.env.ADMIN_API_SECRET;
      if (!expectedSecret || providedSecret !== expectedSecret) {
        return res.status(401).json({ error: 'unauthorized' });
      }

      const { adSlots, dramaOverrides } = req.body || {};

      if (adSlots !== undefined) {
        await collection.updateOne(
          { _id: 'ad_slots' as any },
          { $set: { value: adSlots } },
          { upsert: true }
        );
      }
      if (dramaOverrides !== undefined) {
        await collection.updateOne(
          { _id: 'drama_overrides' as any },
          { $set: { value: dramaOverrides } },
          { upsert: true }
        );
      }
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'method_not_allowed' });
  } catch (err: any) {
    return res.status(500).json({ error: 'query_failed', message: err.message });
  }
}
