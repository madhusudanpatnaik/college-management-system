const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const { db, getStudentProfileByUserId } = require("../config/db");

const router = express.Router();
router.use(authMiddleware);

function httpError(message, status) {
  return Object.assign(new Error(message), { status });
}

const SELECT_TICKET = `
  SELECT h.id, h.exam_name, h.subject, h.exam_date, h.exam_time, h.hall, h.seat_no, h.created_at,
         s.roll_number, s.registration_number, s.semester, s.section,
         su.full_name AS student_name,
         d.name AS department_name, b.name AS branch_name
  FROM hall_tickets h
  JOIN students s ON s.id = h.student_id
  JOIN users su ON su.id = s.user_id
  LEFT JOIN departments d ON d.id = s.department_id
  LEFT JOIN branches b ON b.id = s.branch_id
`;

// Admin issues a hall ticket to a student.
router.post("/", roleMiddleware("admin"), (req, res) => {
  const studentId = Number(req.body.studentId);
  if (!Number.isInteger(studentId) || studentId <= 0) throw httpError("A valid student is required.", 400);
  if (!db.prepare("SELECT id FROM students WHERE id = ?").get(studentId)) throw httpError("Student not found.", 404);

  const fields = {
    examName: String(req.body.examName || "").trim(),
    subject: String(req.body.subject || "").trim(),
    examDate: String(req.body.examDate || "").trim(),
    examTime: String(req.body.examTime || "").trim(),
    hall: String(req.body.hall || "").trim(),
    seatNo: String(req.body.seatNo || "").trim()
  };
  for (const [key, value] of Object.entries(fields)) {
    if (!value) throw httpError(`Field "${key}" is required.`, 400);
  }

  const result = db
    .prepare(
      `INSERT INTO hall_tickets (student_id, exam_name, subject, exam_date, exam_time, hall, seat_no, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(studentId, fields.examName, fields.subject, fields.examDate, fields.examTime, fields.hall, fields.seatNo, req.user.id);
  return res.status(201).json({ message: "Hall ticket issued.", id: result.lastInsertRowid });
});

// Admin / faculty view all issued hall tickets.
router.get("/", roleMiddleware("admin", "faculty"), (_req, res) => {
  const tickets = db.prepare(`${SELECT_TICKET} ORDER BY h.exam_date ASC, su.full_name ASC`).all();
  return res.json({ tickets });
});

// Student views their own hall tickets.
router.get("/my", roleMiddleware("student"), (req, res) => {
  const student = getStudentProfileByUserId(req.user.id);
  if (!student) throw httpError("Student profile not found.", 404);
  const tickets = db.prepare(`${SELECT_TICKET} WHERE h.student_id = ? ORDER BY h.exam_date ASC`).all(student.id);
  return res.json({ tickets });
});

// Admin can correct an issued hall ticket (e.g. change hall or seat).
router.put("/:id", roleMiddleware("admin"), (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) throw httpError("Invalid hall ticket id.", 400);
  if (!db.prepare("SELECT id FROM hall_tickets WHERE id = ?").get(id)) throw httpError("Hall ticket not found.", 404);

  const fields = {
    examName: String(req.body.examName || "").trim(),
    subject: String(req.body.subject || "").trim(),
    examDate: String(req.body.examDate || "").trim(),
    examTime: String(req.body.examTime || "").trim(),
    hall: String(req.body.hall || "").trim(),
    seatNo: String(req.body.seatNo || "").trim()
  };
  for (const [key, value] of Object.entries(fields)) {
    if (!value) throw httpError(`Field "${key}" is required.`, 400);
  }

  db.prepare(
    "UPDATE hall_tickets SET exam_name = ?, subject = ?, exam_date = ?, exam_time = ?, hall = ?, seat_no = ? WHERE id = ?"
  ).run(fields.examName, fields.subject, fields.examDate, fields.examTime, fields.hall, fields.seatNo, id);
  return res.json({ message: "Hall ticket updated." });
});

router.delete("/:id", roleMiddleware("admin"), (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) throw httpError("Invalid hall ticket id.", 400);
  const result = db.prepare("DELETE FROM hall_tickets WHERE id = ?").run(id);
  if (result.changes === 0) throw httpError("Hall ticket not found.", 404);
  return res.json({ message: "Hall ticket deleted." });
});

module.exports = router;
