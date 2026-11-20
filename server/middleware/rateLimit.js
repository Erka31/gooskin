// Санах ойн rate limit (brute-force, spam хамгаалалт)
const DEFAULT_WINDOW = 15 * 60 * 1000;
const hits = new Map(); // key -> [timestamp, ...]

const recent = (key, windowMs) => {
  const now = Date.now();
  const arr = (hits.get(key) || []).filter((t) => now - t < windowMs);
  hits.set(key, arr);
  return arr;
};

// key-д windowMs хугацаанд max-аас олон оролдлого хийсэн эсэх
export const tooMany = (key, max = 10, windowMs = DEFAULT_WINDOW) =>
  recent(key, windowMs).length >= max;

export const noteAttempt = (key) =>
  hits.set(key, [...(hits.get(key) || []), Date.now()]);

export const resetAttempts = (key) => hits.delete(key);

// Хүсэлт бүрийг тоолдог middleware
export const rateLimit =
  ({ name, max, windowMs = DEFAULT_WINDOW, message }) =>
  (req, res, next) => {
    const key = name + "|" + req.ip;
    if (tooMany(key, max, windowMs)) {
      return res
        .status(429)
        .json({ error: message || "Хэт олон хүсэлт илгээлээ. Түр хүлээнэ үү" });
    }
    noteAttempt(key);
    next();
  };

// Хуучирсан бичлэгийг цагт нэг цэвэрлэх (санах ой дүүрэхээс сэргийлнэ)
setInterval(() => {
  const now = Date.now();
  for (const [k, arr] of hits) {
    if (!arr.some((t) => now - t < 24 * 3600 * 1000)) hits.delete(k);
  }
}, 3600 * 1000).unref();
