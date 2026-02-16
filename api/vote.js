import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_KV_REST_API_URL,
  token: process.env.UPSTASH_KV_REST_API_TOKEN,
});

function getClientIP(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.headers['x-real-ip'] || req.socket?.remoteAddress || 'unknown';
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { skillId, action } = req.body || {};

    if (!skillId || typeof skillId !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid skillId' });
    }
    if (action !== 'like' && action !== 'dislike') {
      return res.status(400).json({ error: 'Action must be "like" or "dislike"' });
    }

    // Rate limit: one vote per IP per skill per 24h
    const ip = getClientIP(req);
    const dedupKey = `dedup:${ip}:${skillId}`;
    const existing = await redis.get(dedupKey);

    if (existing) {
      return res.status(429).json({
        error: 'Already voted for this skill recently',
        existingVote: existing,
      });
    }

    // Record vote
    const voteKey = `votes:${skillId}`;
    const field = action === 'like' ? 'likes' : 'dislikes';
    await redis.hincrby(voteKey, field, 1);

    // Set dedup key with 24h TTL
    await redis.set(dedupKey, action, { ex: 86400 });

    // Return updated counts
    const data = await redis.hgetall(voteKey);
    return res.status(200).json({
      skillId,
      action,
      likes: parseInt(data?.likes || '0', 10),
      dislikes: parseInt(data?.dislikes || '0', 10),
    });
  } catch (err) {
    console.error('Vote failed:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
