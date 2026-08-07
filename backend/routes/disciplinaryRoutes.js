const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const { db, getStudentProfileByUserId } = require("../config/db");

const router = express.Router();
router.use(authMiddleware);

const ACTION_TYPES = ["warning", "suspension", "fine", "note"];

function httpError(message, status) {
  return Object.assign(new Error(message), { status });
}

const SELECT_ACTION = `
  SELECT d.id, d.action_type, d.reason, d.action_date, d.remarks, d.created_at,
         s.roll_number, su.full_name AS student_name,
         ru.full_name AS recorded_by_name
  FROM disciplinary_actions d
  JOIN students s ON s.id = d.student_id
  JOIN users su ON su.id = s.user_id
  LEFT JOIN users ru ON ru.id = d.recorded_by
`;

// Admin / faculty record a disciplinary action (or appreciation) for a student.
router.post("/", roleMiddleware("admin", "faculty"), (req, res) => {
  const studentId = Number(req.body.studentId);
  if (!Number.isInteger(studentId) || studentId <= 0) throw httpError("A valid student is required.", 400);
  if (!db.prepare("SELECT id FROM students WHERE id = ?").get(studentId)) throw httpError("Student not found.", 404);

  const actionType = ACTION_TYPES.includes(String(req.body.actionType)) ? String(req.body.actionType) : "warning";
  const reason = String(req.body.reason || "").trim();
  const actionDate = String(req.body.actionDate || "").trim();
  if (!reason) throw httpError("Reason is required.", 400);
  if (!actionDate) throw httpError("Action date is required.", 400);
  const remarks = req.body.remarks ? String(req.body.remarks).trim() : null;

  const result = db
    .prepare(
      `INSERT INTO disciplinary_actions (student_id, action_type, reason, action_date, remarks, recorded_by)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(studentId, actionType, reason, actionDate, remarks, req.user.id);
  return res.status(201).json({ message: "Record added.", id: result.lastInsertRowid });
});

// Admin / faculty view all records.
router.get("/", roleMiddleware("admin", "faculty"), (_req, res) => {
  const records = db.prepare(`${SELECT_ACTION} ORDER BY d.action_date DESC, d.id DESC`).all();
  return res.json({ records });
});

// Student views their own records (read-only — visible to student and teacher).
router.get("/my", roleMiddleware("student"), (req, res) => {
  const student = getStudentProfileByUserId(req.user.id);
  if (!student) throw httpError("Student profile not found.", 404);
  const records = db
    .prepare(`${SELECT_ACTION} WHERE d.student_id = ? ORDER BY d.action_date DESC, d.id DESC`)
    .all(student.id);
  return res.json({ records });
});

// Admin / faculty can correct an existing record.
router.put("/:id", roleMiddleware("admin", "faculty"), (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) throw httpError("Invalid record id.", 400);
  if (!db.prepare("SELECT id FROM disciplinary_actions WHERE id = ?").get(id)) {
    throw httpError("Record not found.", 404);
  }

  const actionType = ACTION_TYPES.includes(String(req.body.actionType)) ? String(req.body.actionType) : "warning";
  const reason = String(req.body.reason || "").trim();
  const actionDate = String(req.body.actionDate || "").trim();
  if (!reason) throw httpError("Reason is required.", 400);
  if (!actionDate) throw httpError("Action date is required.", 400);
  const remarks = req.body.remarks ? String(req.body.remarks).trim() : null;

  db.prepare(
    "UPDATE disciplinary_actions SET action_type = ?, reason = ?, action_date = ?, remarks = ? WHERE id = ?"
  ).run(actionType, reason, actionDate, remarks, id);
  return res.json({ message: "Record updated." });
});

router.delete("/:id", roleMiddleware("admin"), (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) throw httpError("Invalid record id.", 400);
  const result = db.prepare("DELETE FROM disciplinary_actions WHERE id = ?").run(id);
  if (result.changes === 0) throw httpError("Record not found.", 404);
  return res.json({ message: "Record removed." });
});

module.exports = router;
