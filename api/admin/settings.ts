import { getPool } from '../_lib/db';

let tableReady = false;

async function ensureTable() {
  if (tableReady) return;
  const pool = getPool();
  await pool.query('CREATE TABLE IF NOT EXISTS app_settings (key TEXT PRIMARY KEY, value JSONB NOT NULL)');
  tableReady = true;
}

// Shared admin config (ad slots, drama badge/delete overrides) stored in
// Postgres so every visitor sees the same state, instead of each browser's
// own localStorage. Reads are public; writes require the ADMIN_API_SECRET
// header so random visitors can't overwrite it.
export default async function handler(req: any, res: any) {
  const pool = getPool();

  try {
    await ensureTable();
  } catch (err: any) {
    return res.status(500).json({ error: 'db_unavailable', message: err.message });
  }

  if (req.method === 'GET') {
    const { rows } = await pool.query(
      "SELECT key, value FROM app_settings WHERE key IN ('ad_slots', 'drama_overrides')"
    );
    const result: { adSlots: any; dramaOverrides: any } = { adSlots: null, dramaOverrides: {} };
    for (const row of rows) {
      if (row.key === 'ad_slots') result.adSlots = row.value;
      if (row.key === 'drama_overrides') result.dramaOverrides = row.value;
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
      await pool.query(
        `INSERT INTO app_settings (key, value) VALUES ('ad_slots', $1::jsonb)
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
        [JSON.stringify(adSlots)]
      );
    }
    if (dramaOverrides !== undefined) {
      await pool.query(
        `INSERT INTO app_settings (key, value) VALUES ('drama_overrides', $1::jsonb)
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
        [JSON.stringify(dramaOverrides)]
      );
    }
    return res.status(200).json({ success: true });
  }

  res.status(405).json({ error: 'method_not_allowed' });
}
