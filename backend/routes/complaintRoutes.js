const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const { db, getStudentProfileByUserId } = require("../config/db");

const router = express.Router();
router.use(authMiddleware);

const CATEGORIES = ["academic", "infrastructure", "hostel", "faculty", "administration", "general"];
const STATUSES = ["open", "in_progress", "resolved"];

function httpError(message, status) {
  return Object.assign(new Error(message), { status });
}

function requireStudent(req) {
  const profile = getStudentProfileByUserId(req.user.id);
  if (!profile) throw httpError("Student profile not found.", 404);
  return profile;
}

const SELECT_COMPLAINT = `
  SELECT c.id, c.category, c.subject, c.description, c.status, c.response,
         c.created_at, c.updated_at,
         s.roll_number, su.full_name AS student_name,
         ru.full_name AS responded_by_name
  FROM complaints c
  JOIN students s ON s.id = c.student_id
  JOIN users su ON su.id = s.user_id
  LEFT JOIN users ru ON ru.id = c.responded_by
`;

// Student raises a complaint.
router.post("/", roleMiddleware("student"), (req, res) => {
  const student = requireStudent(req);
  const subject = String(req.body.subject || "").trim();
  const description = String(req.body.description || "").trim();
  if (!subject) throw httpError("Subject is required.", 400);
  if (!description) throw httpError("Description is required.", 400);
  const category = CATEGORIES.includes(String(req.body.category)) ? String(req.body.category) : "general";

  const result = db
    .prepare(
      `INSERT INTO complaints (student_id, category, subject, description, status)
       VALUES (?, ?, ?, ?, 'open')`
    )
    .run(student.id, category, subject, description);
  return res.status(201).json({ message: "Complaint submitted.", id: result.lastInsertRowid });
});

// Student views their own complaints.
router.get("/my", roleMiddleware("student"), (req, res) => {
  const student = requireStudent(req);
  const complaints = db
    .prepare(`${SELECT_COMPLAINT} WHERE c.student_id = ? ORDER BY c.created_at DESC`)
    .all(student.id);
  return res.json({ complaints });
});

// Admin / faculty view all complaints.
router.get("/", roleMiddleware("admin", "faculty"), (_req, res) => {
  const complaints = db.prepare(`${SELECT_COMPLAINT} ORDER BY c.created_at DESC`).all();
  return res.json({ complaints });
});

// Admin / faculty respond to and update the status of a complaint.
router.put("/:id", roleMiddleware("admin", "faculty"), (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) throw httpError("Invalid complaint id.", 400);
  if (!db.prepare("SELECT id FROM complaints WHERE id = ?").get(id)) throw httpError("Complaint not found.", 404);

  const status = String(req.body.status || "");
  if (!STATUSES.includes(status)) throw httpError("Status must be open, in_progress, or resolved.", 400);
  const response = req.body.response ? String(req.body.response).trim() : null;

  db.prepare(
    `UPDATE complaints SET status = ?, response = ?, responded_by = ?, updated_at = datetime('now') WHERE id = ?`
  ).run(status, response, req.user.id, id);
  return res.json({ message: "Complaint updated." });
});

// Admin can remove a complaint (e.g. spam or duplicate).
router.delete("/:id", roleMiddleware("admin"), (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) throw httpError("Invalid complaint id.", 400);
  const result = db.prepare("DELETE FROM complaints WHERE id = ?").run(id);
  if (result.changes === 0) throw httpError("Complaint not found.", 404);
  return res.json({ message: "Complaint deleted." });
});

module.exports = router;
