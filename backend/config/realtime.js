// Server-Sent Events (SSE) broadcaster.
//
// Each node keeps its own SSE responses in an in-memory Set and delivers events
// to them directly. For a single-node deployment that is all that is needed.
//
// For horizontally-scaled (load-balanced) deployments, set REDIS_URL and install
// `ioredis`: mutations are then published to a Redis channel and every node —
// including the one that made the change — fans the event out to its own local
// clients. This closes the "other instances miss the broadcast" gap. Without
// REDIS_URL (or without ioredis installed) it transparently falls back to
// single-node delivery, so there is no dependency cost when it is not needed.

const clients = new Set();
const CHANNEL = "cms:realtime";

let publisher = null;
let redisReady = false;

function deliverLocal(resource) {
  const payload = `event: change\ndata: ${JSON.stringify({ resource })}\n\n`;
  for (const res of clients) {
    try {
      res.write(payload);
    } catch (_error) {
      clients.delete(res);
    }
  }
}

function initRedis() {
  if (!process.env.REDIS_URL) {
    return;
  }

  let Redis;
  try {
    Redis = require("ioredis");
  } catch (_error) {
    console.warn(
      "[realtime] REDIS_URL is set but 'ioredis' is not installed. " +
        "Run `npm install ioredis` to enable cross-instance broadcasts. Using single-node delivery for now."
    );
    return;
  }

  try {
    publisher = new Redis(process.env.REDIS_URL, { lazyConnect: false, maxRetriesPerRequest: 2 });
    const subscriber = new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: 2 });

    subscriber.subscribe(CHANNEL).catch((error) => console.error("[realtime] Redis subscribe failed:", error.message));
    subscriber.on("message", (_channel, message) => {
      try {
        deliverLocal(JSON.parse(message).resource);
      } catch (_error) {
        /* ignore malformed messages */
      }
    });

    publisher.on("ready", () => {
      redisReady = true;
      console.log("[realtime] Redis pub/sub connected — real-time events fan out across instances.");
    });
    const markDown = () => {
      redisReady = false;
    };
    publisher.on("end", markDown);
    publisher.on("close", markDown);
    publisher.on("error", (error) => {
      redisReady = false;
      console.error("[realtime] Redis error, falling back to single-node delivery:", error.message);
    });
  } catch (error) {
    console.error("[realtime] Failed to initialise Redis:", error.message);
    publisher = null;
    redisReady = false;
  }
}

initRedis();

function addClient(res) {
  clients.add(res);
  res.on("close", () => clients.delete(res));
}

function broadcast(resource) {
  if (publisher && redisReady) {
    // Publish once; every node (including this one, via its own subscription)
    // delivers to its local clients. Falls back to local delivery on failure.
    publisher.publish(CHANNEL, JSON.stringify({ resource })).catch(() => deliverLocal(resource));
  } else {
    deliverLocal(resource);
  }
}

function clientCount() {
  return clients.size;
}

function realtimeBackend() {
  return redisReady ? "redis" : "memory";
}

module.exports = { addClient, broadcast, clientCount, realtimeBackend };
