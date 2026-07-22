const redisClient = require('./redisClient');

const BUCKET_CAPACITY = 10;      // max tokens in the bucket
const REFILL_RATE = 1;           // tokens added per second
const REFILL_INTERVAL_MS = 1000; // check refill every 1 second

async function rateLimiter(req, res, next) {
  try {
    const identifier = req.ip; // using IP for now, could use user ID later
    const key = `ratelimit:${identifier}`;

    const now = Date.now();

    // Get current bucket state from Redis
    const bucketData = await redisClient.get(key);

    let tokens;
    let lastRefill;

    if (bucketData) {
      const parsed = JSON.parse(bucketData);
      tokens = parsed.tokens;
      lastRefill = parsed.lastRefill;
    } else {
      // First request ever from this IP — start full
      tokens = BUCKET_CAPACITY;
      lastRefill = now;
    }

    // Calculate how many tokens to add based on time passed
    const timePassed = now - lastRefill;
    const tokensToAdd = Math.floor(timePassed / REFILL_INTERVAL_MS) * REFILL_RATE;

    if (tokensToAdd > 0) {
      tokens = Math.min(BUCKET_CAPACITY, tokens + tokensToAdd);
      lastRefill = now;
    }

    if (tokens < 1) {
      // No tokens left — reject the request
      await redisClient.set(key, JSON.stringify({ tokens, lastRefill }), { EX: 60 });
      return res.status(429).json({ error: 'Too many requests. Please slow down.' });
    }

    // Consume 1 token for this request
    tokens -= 1;
    await redisClient.set(key, JSON.stringify({ tokens, lastRefill }), { EX: 60 });
    res.set('X-RateLimit-Remaining', tokens.toString());
    next(); // allow the request to proceed
    
  } catch (err) {
    console.error('Rate limiter error:', err.message);
    next(); // fail open — don't block requests if rate limiter itself breaks
  }
}

module.exports = rateLimiter;