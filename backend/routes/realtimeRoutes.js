const express = require("express");
const jwt = require("jsonwebtoken");

const { JWT_SECRET } = require("../config/auth");
const { getUserProfileById } = require("../config/db");
const { addClient } = require("../config/realtime");

const router = express.Router();

// Server-Sent Events stream for real-time updates.
//
// EventSource cannot send an Authorization header, so the JWT is passed as a
// query parameter (?token=...) and verified here before the stream opens.
router.get("/", (req, res) => {
  const token = req.query.token;
  if (!token) {
    return res.status(401).json({ message: "Authentication token is required." });
  }

  try {
    const decoded = jwt.verify(String(token), JWT_SECRET);
    const user = getUserProfileById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: "Your session is no longer valid." });
    }
  } catch (_error) {
    return res.status(401).json({ message: "Invalid or expired authentication token." });
  }

  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no"
  });
  if (typeof res.flushHeaders === "function") {
    res.flushHeaders();
  }

  res.write("retry: 3000\n\n");
  res.write(": connected\n\n");
  addClient(res);

  // Keep-alive comment so proxies do not close an idle connection. unref() so
  // the timer never holds the process open.
  const keepAlive = setInterval(() => {
    try {
      res.write(": ping\n\n");
    } catch (_error) {
      clearInterval(keepAlive);
    }
  }, 25000);
  keepAlive.unref();

  const cleanup = () => clearInterval(keepAlive);
  req.on("close", cleanup);
  res.on("close", cleanup);
});

module.exports = router;
