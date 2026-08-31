import dns from 'node:dns';
import { MongoClient, Db } from 'mongodb';

// Some local/ISP DNS resolvers silently fail SRV lookups (needed by
// mongodb+srv:// URIs), which otherwise looks identical to the cluster
// being unreachable. Forcing public resolvers avoids that class of failure;
// harmless in Vercel's environment, which resolves SRV records fine already.
dns.setServers(['8.8.8.8', '1.1.1.1']);

// Reused across warm serverless invocations.
let clientPromise: Promise<MongoClient> | null = null;

function getMongoClient(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not set.');
  }
  if (!clientPromise) {
    clientPromise = new MongoClient(uri).connect();
  }
  return clientPromise;
}

export async function getDb(): Promise<Db> {
  const client = await getMongoClient();
  return client.db('dramabox');
}
