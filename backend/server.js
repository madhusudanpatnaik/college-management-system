// Load environment variables from a local .env when present. dotenv is an
// optional dependency: the server runs fine without it (e.g. when the platform
// injects env vars directly), so a missing module must never crash startup.
try {
  require("dotenv").config({ quiet: true });
} catch (_error) {
  /* dotenv not installed — rely on the ambient environment. */
}

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const path = require("path");
const fs = require("fs");
const rateLimit = require("express-rate-limit");

const { initializeDatabase, db } = require("./config/db");
const authMiddleware = require("./middleware/authMiddleware");

const isProduction = process.env.NODE_ENV === "production";

const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const facultyRoutes = require("./routes/facultyRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const resultRoutes = require("./routes/resultRoutes");
const assignmentRoutes = require("./routes/assignmentRoutes");
const submissionRoutes = require("./routes/submissionRoutes");
const materialRoutes = require("./routes/materialRoutes");
const noticeRoutes = require("./routes/noticeRoutes");
const outingRoutes = require("./routes/outingRoutes");
const academicRoutes = require("./routes/academicRoutes");
const studentRelationshipRoutes = require("./routes/studentRelationshipRoutes");
const placementRoutes = require("./routes/placementRoutes");
const eventRoutes = require("./routes/eventRoutes");
const complaintRoutes = require("./routes/complaintRoutes");
const disciplinaryRoutes = require("./routes/disciplinaryRoutes");
const hallTicketRoutes = require("./routes/hallTicketRoutes");
const collegeRoutes = require("./routes/collegeRoutes");
const realtimeRoutes = require("./routes/realtimeRoutes");
const { broadcast } = require("./config/realtime");

// Resources whose mutations should NOT trigger a real-time broadcast (auth flows
// and per-user actions that other clients don't need to react to).
const REALTIME_EXCLUDE = new Set(["login", "logout", "forgot-password", "reset-password", "placement", "realtime", "me"]);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const frontendDir = path.join(__dirname, "..", "frontend");
const uploadsDir = path.join(__dirname, "uploads");

app.disable("x-powered-by");

// CSRF note: this application uses JWT Bearer tokens sent via the Authorization
// header — NOT via cookies. Because CSRF attacks rely on the browser
// automatically attaching credentials (cookies), and the Authorization header
// is never attached automatically, CSRF protection is structurally unnecessary.
// If the auth strategy ever moves to cookies, add CSRF tokens immediately.

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(
  helmet({
    crossOriginResourcePolicy: false,
    // HSTS: enforce HTTPS in production. Browsers will refuse plain HTTP for 1 year.
    hsts: isProduction
      ? { maxAge: 31536000, includeSubDomains: true, preload: true }
      : false,
    // Content-Security-Policy tuned for the app's actual asset origins.
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:"],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"]
      }
    }
  })
);

// CORS policy. The SPA is served same-origin by this server, so cross-origin
// access is not required by default. Set CORS_ORIGINS to a comma-separated
// allowlist when the frontend is hosted on a different origin. In production we
// fall back to "no cross-origin" rather than the wide-open "*".
const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map((origin) => origin.trim()).filter(Boolean)
  : isProduction
    ? false
    : "*";
app.use(cors({ origin: corsOrigins }));

// Gzip responses (app.js/styles.css shrink ~75%). The SSE stream must NOT be
// compressed — the middleware buffers it, which would stall real-time events.
app.use(
  compression({
    filter: (req, res) => {
      // req.originalUrl, not req.path: the filter runs at first write, by which
      // time routing has rewritten req.path inside mounted routers.
      if (req.originalUrl.startsWith("/api/realtime")) return false;
      return compression.filter(req, res);
    }
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { message: "Too many requests from this IP, please try again later." }
});
app.use("/api", generalLimiter);

// Uploaded files (assignments, submissions, materials) require authentication.
// Without this, anyone can enumerate and download files by guessing the filename.
app.use("/uploads", authMiddleware, express.static(uploadsDir));

// Static assets: HTML revalidates on every request (so deploys show up
// immediately), while CSS/JS/images/fonts are cached for a day and served
// from browser cache on repeat visits.
app.use(
  express.static(frontendDir, {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".html")) {
        res.setHeader("Cache-Control", "no-cache");
      } else {
        res.setHeader("Cache-Control", "public, max-age=86400");
      }
    }
  })
);

// Public liveness/readiness probe — registered before the authenticated routers
// (one of which applies auth to the whole /api namespace) so it stays open.
app.get("/api/health", (_req, res) => {
  try {
    db.prepare("SELECT 1").get();
    res.json({ status: "ok", uptime: process.uptime(), database: "connected" });
  } catch (_error) {
    res.status(503).json({ status: "degraded", uptime: process.uptime(), database: "unreachable" });
  }
});

// Public configuration endpoint — tells the frontend whether demo mode is active.
// NEVER expose secrets or internal config here.
app.get("/api/config", (_req, res) => {
  res.json({ demoMode: !isProduction });
});

// Real-time SSE stream (self-authenticating via ?token=). Registered before the
// authenticated routers so the query-token auth is used instead of the Bearer
// header those routers require.
app.use("/api/realtime", realtimeRoutes);

// Broadcast a real-time "change" event after any successful API mutation so
// other connected clients refresh the affected view. Registered before the
// routers; the res.on("finish") listener fires once the response is sent.
app.use((req, res, next) => {
  // Capture the path now: Express rewrites req.url/req.path as the request
  // descends into mounted routers, and res.on("finish") fires after routing.
  const originalPath = req.path;
  res.on("finish", () => {
    if (
      originalPath.startsWith("/api/") &&
      ["POST", "PUT", "PATCH", "DELETE"].includes(req.method) &&
      res.statusCode < 400
    ) {
      const resource = originalPath.split("/").filter(Boolean)[1];
      if (resource && !REALTIME_EXCLUDE.has(resource)) {
        broadcast(resource);
      }
    }
  });
  next();
});

app.use("/api", authRoutes);
app.use("/api", studentRelationshipRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/materials", materialRoutes);
app.use("/api/notices", noticeRoutes);
app.use("/api/outing", outingRoutes);
app.use("/api/academics", academicRoutes);
app.use("/api/placement", placementRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/disciplinary", disciplinaryRoutes);
app.use("/api/hall-tickets", hallTicketRoutes);
app.use("/api/college", collegeRoutes);

app.get("/", (_req, res) => {
  res.sendFile(path.join(frontendDir, "login.html"));
});

app.use("/api", (_req, res) => {
  res.status(404).json({ message: "API route not found." });
});

app.use((err, _req, res, _next) => {
  // Map multer upload failures (oversized files, etc.) to 400 instead of 500.
  let status = err.status || 500;
  if (err.code === "LIMIT_FILE_SIZE") {
    status = 400;
    err.message = "The uploaded file exceeds the maximum allowed size.";
  } else if (typeof err.code === "string" && err.code.startsWith("LIMIT_")) {
    status = 400;
  }

  const message =
    status >= 500 ? "Something went wrong while processing your request." : err.message;

  if (status >= 500) {
    console.error(err);
  }

  res.status(status).json({ message });
});

function registerGracefulShutdown(server) {
  let shuttingDown = false;

  const shutdown = (signal) => {
    if (shuttingDown) {
      return;
    }
    shuttingDown = true;
    console.log(`Received ${signal}, shutting down gracefully...`);

    try {
      // Checkpoint the WAL and release the database file cleanly.
      db.close();
    } catch (error) {
      console.error("Failed to close the database during shutdown.", error);
    }

    server.close(() => {
      console.log("HTTP server closed. Goodbye.");
      process.exit(0);
    });

    // Force-exit if connections do not drain within 10s.
    setTimeout(() => process.exit(1), 10000).unref();
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

async function startServer() {
  await initializeDatabase();

  if (require.main === module) {
    const server = app.listen(PORT, () => {
      console.log(`College Management System API running on http://localhost:${PORT}`);
    });
    registerGracefulShutdown(server);
    return server;
  }
}

if (require.main === module) {
  startServer().catch((error) => {
    console.error("Failed to start the College Management System server.", error);
    process.exit(1);
  });
}

module.exports = { app, initializeDatabase };
