import dns from 'node:dns';
import { MongoClient, Db } from 'mongodb';

// Some local/ISP DNS resolvers silently fail SRV lookups (needed by
// mongodb+srv:// URIs), which otherwise looks identical to the cluster
// being unreachable. Forcing public resolvers avoids that class of failure;
// harmless in Vercel's environment, which resolves SRV records fine already.
dns.setServers(['8.8.8.8', '1.1.1.1']);

// Reused across warm serverless invocations.
let clientPromise: Promise<MongoClient> | null = null;
let indexesEnsured = false;

function getMongoClient(): Promise<MongoClient> {
  // Some Vercel MongoDB/Atlas integrations create the env var under a
  // product-prefixed name (e.g. jmboxdb_MONGODB_URI) instead of a plain
  // MONGODB_URI. Check both so the connection doesn't silently fail just
  // because the dashboard named it differently than the code expects.
  const uri = process.env.MONGODB_URI || process.env.jmboxdb_MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI (or jmboxdb_MONGODB_URI) is not set.');
  }
  if (!clientPromise) {
    clientPromise = new MongoClient(uri).connect();
  }
  return clientPromise;
}

export async function getDb(): Promise<Db> {
  const client = await getMongoClient();
  const db = client.db('dramabox');

  // Enforce email uniqueness at the DB level — the signup handler only
  // checks-then-inserts, which leaves a race-condition window under
  // concurrent signups for the same address. Cheap no-op once the index
  // already exists, so safe to call on every warm invocation too.
  if (!indexesEnsured) {
    indexesEnsured = true;
    db.collection('members')
      .createIndex({ email: 1 }, { unique: true })
      .catch(err => console.error('Failed to ensure members.email index:', err.message));
  }

  return db;
}
