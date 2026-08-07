// Shared authorization helpers reused across route modules.

const { db, getFacultyProfileByUserId } = require("../config/db");

/**
 * Returns true if the user (by user_id) is the assigned faculty for the given course.
 * Used to enforce that faculty can only modify their own courses.
 */
function facultyOwnsCourse(userId, courseId) {
  const faculty = getFacultyProfileByUserId(userId);
  if (!faculty) {
    return false;
  }

  const course = db.prepare("SELECT id FROM courses WHERE id = ? AND faculty_id = ?").get(courseId, faculty.id);
  return Boolean(course);
}

module.exports = { facultyOwnsCourse };
