import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_KV_REST_API_URL,
  token: process.env.UPSTASH_KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // Scan all keys matching votes:*
    const votes = {};
    let cursor = 0;

    do {
      const [nextCursor, keys] = await redis.scan(cursor, { match: 'votes:*', count: 200 });
      cursor = nextCursor;

      if (keys.length > 0) {
        // Pipeline: batch-fetch all hashes
        const pipeline = redis.pipeline();
        for (const key of keys) {
          pipeline.hgetall(key);
        }
        const results = await pipeline.exec();

        for (let i = 0; i < keys.length; i++) {
          const skillId = keys[i].replace('votes:', '');
          const data = results[i] || {};
          votes[skillId] = {
            likes: parseInt(data.likes || '0', 10),
            dislikes: parseInt(data.dislikes || '0', 10),
          };
        }
      }
    } while (cursor !== 0);

    res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60');
    return res.status(200).json(votes);
  } catch (err) {
    console.error('Failed to fetch votes:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
