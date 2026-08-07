// Minimal Server-Sent Events (SSE) broadcaster.
//
// Every open SSE response is tracked. When any resource is mutated, the server
// broadcasts a small "change" event so connected clients can refresh the
// affected view in real time.

const clients = new Set();

function addClient(res) {
  clients.add(res);
  res.on("close", () => clients.delete(res));
}

function broadcast(resource) {
  const payload = `event: change\ndata: ${JSON.stringify({ resource })}\n\n`;
  for (const res of clients) {
    try {
      res.write(payload);
    } catch (_error) {
      clients.delete(res);
    }
  }
}

function clientCount() {
  return clients.size;
}

module.exports = { addClient, broadcast, clientCount };
