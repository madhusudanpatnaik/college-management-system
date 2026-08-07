const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const { db } = require("../config/db");

const router = express.Router();
router.use(authMiddleware);

const CATEGORIES = ["academic", "cultural", "sports", "placement", "general"];

function httpError(message, status) {
  return Object.assign(new Error(message), { status });
}

function normalizeEvent(body) {
  const title = String(body.title || "").trim();
  const description = String(body.description || "").trim();
  const eventDate = String(body.eventDate || "").trim();

  if (!title) throw httpError("Title is required.", 400);
  if (!description) throw httpError("Description is required.", 400);
  if (!eventDate) throw httpError("Event date is required.", 400);

  return {
    title,
    description,
    eventDate,
    category: CATEGORIES.includes(String(body.category)) ? String(body.category) : "general",
    eventTime: body.eventTime ? String(body.eventTime).trim() : null,
    venue: body.venue ? String(body.venue).trim() : null
  };
}

// All roles can see events.
router.get("/", (_req, res) => {
  const events = db
    .prepare(
      `
        SELECT e.id, e.title, e.description, e.category, e.event_date, e.event_time, e.venue, e.created_at,
               u.full_name AS created_by_name
        FROM events e
        LEFT JOIN users u ON u.id = e.created_by
        ORDER BY e.event_date ASC, e.event_time ASC
      `
    )
    .all();
  return res.json({ events });
});

router.post("/", roleMiddleware("admin", "faculty"), (req, res) => {
  const e = normalizeEvent(req.body);
  const result = db
    .prepare(
      `INSERT INTO events (title, description, category, event_date, event_time, venue, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(e.title, e.description, e.category, e.eventDate, e.eventTime, e.venue, req.user.id);
  return res.status(201).json({ message: "Event created.", id: result.lastInsertRowid });
});

router.put("/:id", roleMiddleware("admin", "faculty"), (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) throw httpError("Invalid event id.", 400);
  if (!db.prepare("SELECT id FROM events WHERE id = ?").get(id)) throw httpError("Event not found.", 404);

  const e = normalizeEvent(req.body);
  db.prepare(
    `UPDATE events SET title = ?, description = ?, category = ?, event_date = ?, event_time = ?, venue = ? WHERE id = ?`
  ).run(e.title, e.description, e.category, e.eventDate, e.eventTime, e.venue, id);
  return res.json({ message: "Event updated." });
});

router.delete("/:id", roleMiddleware("admin"), (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) throw httpError("Invalid event id.", 400);
  const result = db.prepare("DELETE FROM events WHERE id = ?").run(id);
  if (result.changes === 0) throw httpError("Event not found.", 404);
  return res.json({ message: "Event deleted." });
});

module.exports = router;
