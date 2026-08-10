const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const Database = require("better-sqlite3");
const { PLACEMENT_QUESTIONS } = require("./placementData");

const databaseDir = path.join(__dirname, "..", "..", "database");
// The test suite runs against an isolated database file so it never mutates the
// demo/production data. Jest sets NODE_ENV=test automatically.
const databaseFile = process.env.NODE_ENV === "test" ? "cms.test.db" : "cms.db";
const databasePath = path.join(databaseDir, databaseFile);
const schemaPath = path.join(databaseDir, "cms.sql");
const uploadsDir = path.join(__dirname, "..", "uploads");

if (!fs.existsSync(databaseDir)) {
  fs.mkdirSync(databaseDir, { recursive: true });
}

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Normalise call-site params into better-sqlite3's bind form. Supports
// .run(a, b), .run([a, b]) and .run({ name: v }), and coerces the value types
// better-sqlite3 rejects (undefined -> NULL, boolean -> 0/1).
function coerce(value) {
  if (value === undefined) return null;
  if (typeof value === "boolean") return value ? 1 : 0;
  return value;
}

function toBindArgs(params) {
  if (
    params.length === 1 &&
    params[0] &&
    typeof params[0] === "object" &&
    !Array.isArray(params[0]) &&
    !Buffer.isBuffer(params[0])
  ) {
    // Named-parameter object — passed through as a single argument.
    const named = {};
    for (const [key, value] of Object.entries(params[0])) named[key] = coerce(value);
    return [named];
  }

  const positional = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
  return positional.map(coerce);
}

class StatementWrapper {
  constructor(driver, sql) {
    this.driver = driver;
    this.sql = sql;
    this._stmt = null;
  }

  statement() {
    this.driver.ensureReady();
    if (!this._stmt) {
      this._stmt = this.driver.database.prepare(this.sql);
    }
    return this._stmt;
  }

  get(...params) {
    return this.statement().get(...toBindArgs(params));
  }

  all(...params) {
    return this.statement().all(...toBindArgs(params));
  }

  run(...params) {
    const info = this.statement().run(...toBindArgs(params));
    return { lastInsertRowid: Number(info.lastInsertRowid), changes: info.changes };
  }
}

class SQLDriver {
  constructor() {
    this.database = null;
    // Retained for API compatibility with earlier call sites; no longer used
    // now that writes go straight to a real file-backed database.
    this.inTransaction = 0;
    this.bulkLoading = false;
  }

  attachDatabase(database) {
    this.database = database;
  }

  ensureReady() {
    if (!this.database) {
      throw new Error("Database has not been initialized.");
    }
  }

  pragma(statement) {
    this.ensureReady();
    this.database.pragma(statement);
  }

  exec(sql) {
    this.ensureReady();
    this.database.exec(sql);
  }

  prepare(sql) {
    this.ensureReady();
    return new StatementWrapper(this, sql);
  }

  // better-sqlite3 wraps fn in a real, atomic SQLite transaction and returns a
  // callable — matching the previous driver's contract.
  transaction(fn) {
    this.ensureReady();
    return this.database.transaction(fn);
  }

  getLastInsertRowid() {
    return Number(this.database.prepare("SELECT last_insert_rowid() AS id").get().id);
  }

  getRowsModified() {
    return this.database.prepare("SELECT changes() AS n").get().n;
  }

  // With a durable, file-backed database there is no manual full-file
  // serialization to perform. Kept as a no-op so existing call sites are safe.
  persistIfNeeded() {}

  close() {
    if (this.database) {
      this.database.close();
      this.database = null;
    }
  }
}

const db = new SQLDriver();

function mapUserProfile(row) {
  if (!row) {
    return null;
  }

  const assignedFacultyId = row.student_faculty_id || row.advisor_faculty_id || null;

  return {
    id: row.id,
    role: row.role,
    fullName: row.full_name,
    email: row.email,
    departmentId: row.department_id,
    departmentName: row.department_name || null,
    createdAt: row.created_at,
    branchId: row.branch_id || null,
    branchName: row.branch_name || null,
    studentProfile: row.student_profile_id
      ? {
          id: row.student_profile_id,
          rollNumber: row.roll_number,
          registrationNumber: row.registration_number,
          semester: row.student_semester,
          section: row.section,
          advisorFacultyId: assignedFacultyId,
          facultyId: assignedFacultyId,
          branchId: row.student_branch_id || row.branch_id || null,
          branchName: row.student_branch_name || row.branch_name || null
        }
      : null,
    facultyProfile: row.faculty_profile_id
      ? {
          id: row.faculty_profile_id,
          employeeCode: row.employee_code,
          designation: row.designation,
          branchId: row.faculty_branch_id || row.branch_id || null,
          branchName: row.faculty_branch_name || row.branch_name || null
        }
      : null
  };
}

function getUserProfileById(userId) {
  const row = db
    .prepare(
      `
        SELECT
          u.id,
          u.role,
          u.full_name,
          u.email,
          u.department_id,
          u.created_at,
          d.name AS department_name,
          branch_lookup.id AS branch_id,
          branch_lookup.name AS branch_name,
          s.id AS student_profile_id,
          s.roll_number,
          s.registration_number,
          s.semester AS student_semester,
          s.section,
          s.faculty_id AS student_faculty_id,
          s.advisor_faculty_id,
          s.branch_id AS student_branch_id,
          student_branch.name AS student_branch_name,
          f.id AS faculty_profile_id,
          f.employee_code,
          f.designation,
          f.branch_id AS faculty_branch_id,
          faculty_branch.name AS faculty_branch_name
        FROM users u
        LEFT JOIN students s ON s.user_id = u.id
        LEFT JOIN faculty f ON f.user_id = u.id
        LEFT JOIN departments d ON d.id = COALESCE(s.department_id, f.department_id, u.department_id)
        LEFT JOIN branches branch_lookup ON branch_lookup.id = COALESCE(s.branch_id, f.branch_id)
        LEFT JOIN branches student_branch ON student_branch.id = s.branch_id
        LEFT JOIN branches faculty_branch ON faculty_branch.id = f.branch_id
        WHERE u.id = ? AND u.is_active = 1
      `
    )
    .get(userId);

  return mapUserProfile(row);
}

function getUserAccountByEmail(email) {
  return db
    .prepare(
      `
        SELECT
          u.*,
          d.name AS department_name,
          branch_lookup.id AS branch_id,
          branch_lookup.name AS branch_name,
          s.id AS student_profile_id,
          s.roll_number,
          s.registration_number,
          s.semester AS student_semester,
          s.section,
          s.faculty_id AS student_faculty_id,
          s.advisor_faculty_id,
          s.branch_id AS student_branch_id,
          student_branch.name AS student_branch_name,
          f.id AS faculty_profile_id,
          f.employee_code,
          f.designation,
          f.branch_id AS faculty_branch_id,
          faculty_branch.name AS faculty_branch_name
        FROM users u
        LEFT JOIN students s ON s.user_id = u.id
        LEFT JOIN faculty f ON f.user_id = u.id
        LEFT JOIN departments d ON d.id = COALESCE(s.department_id, f.department_id, u.department_id)
        LEFT JOIN branches branch_lookup ON branch_lookup.id = COALESCE(s.branch_id, f.branch_id)
        LEFT JOIN branches student_branch ON student_branch.id = s.branch_id
        LEFT JOIN branches faculty_branch ON faculty_branch.id = f.branch_id
        WHERE LOWER(u.email) = LOWER(?) AND u.is_active = 1
      `
    )
    .get(email);
}

function getStudentProfileByUserId(userId) {
  return db
    .prepare(
      `
        SELECT s.*, u.full_name, u.email, d.name AS department_name, b.name AS branch_name, b.code AS branch_code
        FROM students s
        JOIN users u ON u.id = s.user_id
        JOIN departments d ON d.id = s.department_id
        LEFT JOIN branches b ON b.id = s.branch_id
        WHERE s.user_id = ?
      `
    )
    .get(userId);
}

function getFacultyProfileByUserId(userId) {
  return db
    .prepare(
      `
        SELECT f.*, u.full_name, u.email, d.name AS department_name, b.name AS branch_name, b.code AS branch_code
        FROM faculty f
        JOIN users u ON u.id = f.user_id
        JOIN departments d ON d.id = f.department_id
        LEFT JOIN branches b ON b.id = f.branch_id
        WHERE f.user_id = ?
      `
    )
    .get(userId);
}

// Strict identifier pattern: only letters, digits, and underscores are allowed.
// This prevents SQL injection when table/column names are interpolated into DDL.
const SAFE_IDENTIFIER = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

function assertSafeIdentifier(value, label) {
  if (!SAFE_IDENTIFIER.test(value)) {
    throw new Error(`Unsafe ${label}: "${value}" — only letters, digits, and underscores are allowed.`);
  }
}

function getTableColumns(tableName) {
  assertSafeIdentifier(tableName, "table name");
  return db.prepare(`PRAGMA table_info(${tableName})`).all().map((column) => column.name);
}

function ensureColumn(tableName, columnName, definition) {
  assertSafeIdentifier(tableName, "table name");
  assertSafeIdentifier(columnName, "column name");
  if (!getTableColumns(tableName).includes(columnName)) {
    db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
  }
}

function getOrCreateDepartment(name, code) {
  const existing = db.prepare("SELECT id FROM departments WHERE UPPER(code) = UPPER(?)").get(code);
  if (existing) {
    return existing.id;
  }

  return db.prepare("INSERT INTO departments (name, code) VALUES (?, ?)").run(name, code).lastInsertRowid;
}

function getOrCreateBranch(departmentId, name, code) {
  const existing = db.prepare("SELECT id FROM branches WHERE UPPER(code) = UPPER(?)").get(code);
  if (existing) {
    return existing.id;
  }

  return db.prepare("INSERT INTO branches (department_id, name, code) VALUES (?, ?, ?)").run(departmentId, name, code)
    .lastInsertRowid;
}

function ensureAcademicSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS branches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      department_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      code TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (department_id) REFERENCES departments (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS exams (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER NOT NULL,
      exam_name TEXT NOT NULL,
      exam_date TEXT NOT NULL,
      exam_time TEXT NOT NULL,
      created_by INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE,
      FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE CASCADE
    );
  `);

  ensureColumn("faculty", "branch_id", "INTEGER");
  ensureColumn("faculty", "salary_status", "TEXT NOT NULL DEFAULT 'pending'");
  ensureColumn("students", "branch_id", "INTEGER");
  ensureColumn("students", "faculty_id", "INTEGER");
  ensureColumn("courses", "branch_id", "INTEGER");
  ensureColumn("courses", "academic_course", "TEXT NOT NULL DEFAULT 'Core Curriculum'");

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_students_faculty_id ON students (faculty_id);
    CREATE INDEX IF NOT EXISTS idx_timetable_faculty_id ON timetable (faculty_id);
  `);

  db.prepare("UPDATE students SET faculty_id = COALESCE(faculty_id, advisor_faculty_id)").run();
  db.prepare("UPDATE students SET advisor_faculty_id = COALESCE(advisor_faculty_id, faculty_id)").run();
}

function resolveAcademicTrack(code) {
  const normalized = String(code || "").toUpperCase();

  if (normalized.startsWith("CSE")) {
    return { departmentCode: "BTECH", branchCode: "CSE-CORE", academicCourse: "Computer Science Engineering" };
  }

  if (normalized.startsWith("ECE")) {
    return { departmentCode: "BTECH", branchCode: "ECE", academicCourse: "Electronics and Communication Engineering" };
  }

  if (normalized.startsWith("BBA") || normalized.startsWith("MBA")) {
    return { departmentCode: "MBA", branchCode: "MBA-FIN", academicCourse: "Business Administration" };
  }

  if (normalized.startsWith("MCA")) {
    return { departmentCode: "MCA", branchCode: "MCA-APP", academicCourse: "Computer Applications" };
  }

  return { departmentCode: "BTECH", branchCode: "CSE-CORE", academicCourse: "Computer Science Engineering" };
}

function ensureAcademicSeedData() {
  const departmentIds = {
    BTECH: getOrCreateDepartment("BTech", "BTECH"),
    MTECH: getOrCreateDepartment("MTech", "MTECH"),
    MBA: getOrCreateDepartment("MBA", "MBA"),
    MCA: getOrCreateDepartment("MCA", "MCA")
  };

  const branchIds = {
    "CSE-CORE": getOrCreateBranch(departmentIds.BTECH, "CSE Core", "CSE-CORE"),
    "CSE-AIML": getOrCreateBranch(departmentIds.BTECH, "CSE AIML", "CSE-AIML"),
    ECE: getOrCreateBranch(departmentIds.BTECH, "ECE", "ECE"),
    "MTECH-CSE": getOrCreateBranch(departmentIds.MTECH, "CSE Research", "MTECH-CSE"),
    "MBA-FIN": getOrCreateBranch(departmentIds.MBA, "Finance", "MBA-FIN"),
    "MBA-MKT": getOrCreateBranch(departmentIds.MBA, "Marketing", "MBA-MKT"),
    "MCA-APP": getOrCreateBranch(departmentIds.MCA, "Application Development", "MCA-APP")
  };

  const legacyDepartments = db
    .prepare(
      `
        SELECT id, code
        FROM departments
        WHERE UPPER(code) IN ('CSE', 'ECE', 'BBA')
      `
    )
    .all();

  legacyDepartments.forEach((department) => {
    const track = resolveAcademicTrack(department.code);
    const mappedDepartmentId = departmentIds[track.departmentCode];
    const mappedBranchId = branchIds[track.branchCode];

    db.prepare("UPDATE users SET department_id = ? WHERE department_id = ?").run(mappedDepartmentId, department.id);
    db.prepare("UPDATE faculty SET department_id = ?, branch_id = COALESCE(branch_id, ?) WHERE department_id = ?").run(
      mappedDepartmentId,
      mappedBranchId,
      department.id
    );
    db.prepare("UPDATE students SET department_id = ?, branch_id = COALESCE(branch_id, ?) WHERE department_id = ?").run(
      mappedDepartmentId,
      mappedBranchId,
      department.id
    );
    db.prepare(
      "UPDATE courses SET department_id = ?, branch_id = COALESCE(branch_id, ?), academic_course = COALESCE(NULLIF(academic_course, ''), ?) WHERE department_id = ?"
    ).run(mappedDepartmentId, mappedBranchId, track.academicCourse, department.id);
    db.prepare("UPDATE timetable SET department_id = ? WHERE department_id = ?").run(mappedDepartmentId, department.id);
  });

  const courses = db.prepare("SELECT id, code FROM courses").all();
  courses.forEach((course) => {
    const track = resolveAcademicTrack(course.code);
    const mappedDepartmentId = departmentIds[track.departmentCode];
    const mappedBranchId = branchIds[track.branchCode];

    db.prepare(
      `
        UPDATE courses
        SET department_id = ?,
            branch_id = COALESCE(branch_id, ?),
            academic_course = COALESCE(NULLIF(academic_course, ''), ?)
        WHERE id = ?
      `
    ).run(mappedDepartmentId, mappedBranchId, track.academicCourse, course.id);

    db.prepare("UPDATE timetable SET department_id = ? WHERE course_id = ?").run(mappedDepartmentId, course.id);
  });

  // The legacy placeholder departments (CSE/ECE/BBA from the original schema) are
  // superseded by BTECH/MTECH/MBA/MCA. Once the migration above has moved every
  // reference off them, remove the now-orphaned placeholders so they no longer
  // clutter department/branch selectors. Guarded to only delete rows with zero
  // dependents, so admin-created departments are never touched.
  db.prepare(
    `
      DELETE FROM departments
      WHERE UPPER(code) IN ('CSE', 'ECE', 'BBA')
        AND id NOT IN (SELECT department_id FROM branches WHERE department_id IS NOT NULL)
        AND id NOT IN (SELECT department_id FROM courses WHERE department_id IS NOT NULL)
        AND id NOT IN (SELECT department_id FROM faculty WHERE department_id IS NOT NULL)
        AND id NOT IN (SELECT department_id FROM students WHERE department_id IS NOT NULL)
        AND id NOT IN (SELECT department_id FROM users WHERE department_id IS NOT NULL)
        AND id NOT IN (SELECT department_id FROM timetable WHERE department_id IS NOT NULL)
    `
  ).run();
}

function createUserIfMissing({ role, fullName, email, password, departmentId = null }) {
  const existing = db.prepare("SELECT id FROM users WHERE LOWER(email) = LOWER(?)").get(email);

  if (existing) {
    return existing.id;
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const result = db
    .prepare(
      `
        INSERT INTO users (role, full_name, email, password_hash, department_id)
        VALUES (?, ?, ?, ?, ?)
      `
    )
    .run(role, fullName, email, passwordHash, departmentId);

  return result.lastInsertRowid;
}

// The seed data references a handful of uploaded files. Regenerate them on disk
// when missing so a fresh checkout or container (where uploads/ is not shipped)
// stays consistent — no seeded row should point at a file that does not exist.
function ensureSeedUploadFiles() {
  const seedFiles = {
    "seed-assignment-brief.txt":
      "Assignment brief: design a third-normal-form schema for the supplied admissions workflow and document your assumptions.\n",
    "seed-submission-answer.txt":
      "Sample submission placeholder uploaded for the seeded assignment.\n",
    "seed-db-handbook.txt":
      "Database revision notes covering ER modeling, normalization, indexing, and transactions.\n"
  };

  for (const [name, content] of Object.entries(seedFiles)) {
    const filePath = path.join(uploadsDir, name);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, content, "utf8");
    }
  }
}

function ensureSeedUsers() {
  const btechDepartment = db.prepare("SELECT id FROM departments WHERE code = ?").get("BTECH");
  const cseBranch = db.prepare("SELECT id FROM branches WHERE code = ?").get("CSE-CORE");
  const cseDepartmentId = btechDepartment ? btechDepartment.id : null;
  const cseBranchId = cseBranch ? cseBranch.id : null;

  const adminUserId = createUserIfMissing({
    role: "admin",
    fullName: "System Administrator",
    email: "admin@college.edu",
    password: "Admin@123"
  });

  const facultyUserId = createUserIfMissing({
    role: "faculty",
    fullName: "Dr. Priya Nair",
    email: "faculty@college.edu",
    password: "Faculty@123",
    departmentId: cseDepartmentId
  });

  const studentUserId = createUserIfMissing({
    role: "student",
    fullName: "Aarav Sharma",
    email: "student@college.edu",
    password: "Student@123",
    departmentId: cseDepartmentId
  });

  const facultyProfile = db.prepare("SELECT id FROM faculty WHERE user_id = ?").get(facultyUserId);
  let facultyId = facultyProfile ? facultyProfile.id : null;

  if (!facultyId) {
    const result = db
      .prepare(
        `
          INSERT INTO faculty (user_id, employee_code, designation, department_id, branch_id, salary_status)
          VALUES (?, ?, ?, ?, ?, ?)
        `
      )
      .run(facultyUserId, "FAC001", "Associate Professor", cseDepartmentId, cseBranchId, "credited");
    facultyId = result.lastInsertRowid;
  } else {
    db.prepare("UPDATE faculty SET department_id = ?, branch_id = COALESCE(branch_id, ?), salary_status = COALESCE(NULLIF(salary_status, ''), 'credited') WHERE id = ?")
      .run(cseDepartmentId, cseBranchId, facultyId);
  }

  const studentProfile = db.prepare("SELECT id FROM students WHERE user_id = ?").get(studentUserId);
  let studentId = studentProfile ? studentProfile.id : null;

  if (!studentId) {
    const result = db
      .prepare(
        `
          INSERT INTO students (
            user_id,
            roll_number,
            registration_number,
            department_id,
            branch_id,
            semester,
            section,
            faculty_id,
            advisor_faculty_id
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `
      )
      .run(studentUserId, "CSE2024-001", "REG2024-001", cseDepartmentId, cseBranchId, 5, "A", facultyId, facultyId);
    studentId = result.lastInsertRowid;
  } else {
    db.prepare(
      `
        UPDATE students
        SET department_id = ?,
            branch_id = COALESCE(branch_id, ?),
            faculty_id = COALESCE(faculty_id, advisor_faculty_id, ?),
            advisor_faculty_id = COALESCE(advisor_faculty_id, faculty_id, ?)
        WHERE id = ?
      `
    ).run(cseDepartmentId, cseBranchId, facultyId, facultyId, studentId);
  }

  db.prepare("UPDATE courses SET faculty_id = ?, department_id = ?, branch_id = COALESCE(branch_id, ?), academic_course = COALESCE(NULLIF(academic_course, ''), 'Computer Science Engineering') WHERE semester = 5 AND code LIKE 'CSE%'")
    .run(facultyId, cseDepartmentId, cseBranchId);

  seedFees(studentId);
  seedTimetable(cseDepartmentId, facultyId);
  seedAttendance(studentId, facultyId, cseDepartmentId);
  seedResults(studentId, facultyId, cseDepartmentId);
  seedNotices(adminUserId);
  seedAssignments(studentId, facultyId);
  seedMaterials(facultyId);
  seedOutingRequests(studentId);
  seedCommunityData(studentId, adminUserId, facultyUserId);
}

function seedFees(studentId) {
  const feeExists = db.prepare("SELECT id FROM fees WHERE student_id = ? AND semester = ?").get(studentId, 5);

  if (!feeExists) {
    db.prepare(
      `
        INSERT INTO fees (student_id, semester, total_amount, paid_amount, due_date, status)
        VALUES (?, ?, ?, ?, ?, ?)
      `
    ).run(studentId, 5, 85000, 60000, "2026-04-10", "partial");
  }
}

function seedTimetable(departmentId, facultyId) {
  const count = db.prepare("SELECT COUNT(*) AS total FROM timetable WHERE department_id = ?").get(departmentId);

  if (count.total > 0) {
    return;
  }

  const courseRows = db
    .prepare("SELECT id, code FROM courses WHERE department_id = ? AND semester = 5 ORDER BY id")
    .all(departmentId);

  const entries = [
    { day: "Monday", courseCode: "CSE501", start: "09:00", end: "10:00", room: "Lab-201" },
    { day: "Monday", courseCode: "CSE502", start: "10:15", end: "11:15", room: "A-203" },
    { day: "Tuesday", courseCode: "CSE503", start: "09:00", end: "10:00", room: "B-104" },
    { day: "Wednesday", courseCode: "CSE501", start: "11:30", end: "12:30", room: "Lab-201" },
    { day: "Thursday", courseCode: "CSE502", start: "13:30", end: "14:30", room: "A-203" },
    { day: "Friday", courseCode: "CSE503", start: "10:15", end: "11:15", room: "B-104" }
  ];

  const insert = db.prepare(
    `
      INSERT INTO timetable (department_id, course_id, faculty_id, day_of_week, start_time, end_time, room_no)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `
  );

  for (const entry of entries) {
    const course = courseRows.find((row) => row.code === entry.courseCode);
    if (!course) {
      continue;
    }
    insert.run(departmentId, course.id, facultyId, entry.day, entry.start, entry.end, entry.room);
  }
}

function seedAttendance(studentId, facultyId, departmentId) {
  const count = db.prepare("SELECT COUNT(*) AS total FROM attendance WHERE student_id = ?").get(studentId);
  if (count.total > 0) {
    return;
  }

  const courseRows = db
    .prepare("SELECT id FROM courses WHERE semester = 5 AND department_id = ? ORDER BY id")
    .all(departmentId);
  const dates = ["2026-03-17", "2026-03-18", "2026-03-19", "2026-03-20", "2026-03-23"];
  const statuses = ["present", "present", "absent", "present", "late"];
  const insert = db.prepare(
    `
      INSERT INTO attendance (student_id, course_id, faculty_id, date, status)
      VALUES (?, ?, ?, ?, ?)
    `
  );

  courseRows.forEach((course, index) => {
    insert.run(studentId, course.id, facultyId, dates[index % dates.length], statuses[index % statuses.length]);
    insert.run(studentId, course.id, facultyId, dates[(index + 1) % dates.length], "present");
  });
}

function seedResults(studentId, facultyId, departmentId) {
  const count = db.prepare("SELECT COUNT(*) AS total FROM results WHERE student_id = ?").get(studentId);
  if (count.total > 0) {
    return;
  }

  const courseRows = db
    .prepare("SELECT id, code FROM courses WHERE semester = 5 AND department_id = ? ORDER BY id")
    .all(departmentId);
  const seed = [
    { code: "CSE501", examType: "Mid Semester", marks: 42, maxMarks: 50, grade: "A" },
    { code: "CSE502", examType: "Internal", marks: 38, maxMarks: 50, grade: "B+" },
    { code: "CSE503", examType: "Quiz", marks: 18, maxMarks: 20, grade: "A+" }
  ];

  const insert = db.prepare(
    `
      INSERT INTO results (
        student_id,
        course_id,
        faculty_id,
        exam_type,
        marks_obtained,
        max_marks,
        grade,
        remarks
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `
  );

  seed.forEach((result) => {
    const course = courseRows.find((row) => row.code === result.code);
    if (!course) {
      return;
    }
    insert.run(
      studentId,
      course.id,
      facultyId,
      result.examType,
      result.marks,
      result.maxMarks,
      result.grade,
      "Consistent academic performance."
    );
  });
}

function seedNotices(adminUserId) {
  const count = db.prepare("SELECT COUNT(*) AS total FROM notices").get();
  if (count.total > 0) {
    return;
  }

  db.prepare(
    `
      INSERT INTO notices (title, content, posted_by, audience)
      VALUES (?, ?, ?, ?)
    `
  ).run(
    "Mid-Semester Review Meeting",
    "All CSE semester 5 students must attend the academic review meeting on March 30 at 11:00 AM in Seminar Hall 2.",
    adminUserId,
    "all"
  );
}

function seedAssignments(studentId, facultyId) {
  const count = db.prepare("SELECT COUNT(*) AS total FROM assignments").get();
  if (count.total === 0) {
    const course = db.prepare("SELECT id FROM courses WHERE code = ?").get("CSE501");
    if (course) {
      db.prepare(
        `
          INSERT INTO assignments (
            course_id,
            faculty_id,
            title,
            description,
            deadline,
            attachment_path,
            attachment_name
          )
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `
      ).run(
        course.id,
        facultyId,
        "Normalization Case Study",
        "Design a third-normal-form schema for the supplied admissions workflow and document your assumptions.",
        "2026-04-05T23:59:00",
        "/uploads/seed-assignment-brief.txt",
        "seed-assignment-brief.txt"
      );
    }
  }

  const assignment = db.prepare("SELECT id FROM assignments ORDER BY id LIMIT 1").get();
  const existingSubmission = db
    .prepare("SELECT id FROM submissions WHERE assignment_id = ? AND student_id = ?")
    .get(assignment ? assignment.id : 0, studentId);

  if (assignment && !existingSubmission) {
    db.prepare(
      `
        INSERT INTO submissions (
          assignment_id,
          student_id,
          notes,
          file_path,
          file_name,
          status
        )
        VALUES (?, ?, ?, ?, ?, ?)
      `
    ).run(
      assignment.id,
      studentId,
      "Initial submission uploaded for review.",
      "/uploads/seed-submission-answer.txt",
      "seed-submission-answer.txt",
      "submitted"
    );
  }
}

function seedMaterials(facultyId) {
  const count = db.prepare("SELECT COUNT(*) AS total FROM materials").get();
  if (count.total > 0) {
    return;
  }

  const course = db.prepare("SELECT id FROM courses WHERE code = ?").get("CSE501");
  if (!course) {
    return;
  }

  db.prepare(
    `
      INSERT INTO materials (course_id, faculty_id, title, description, file_path, file_name)
      VALUES (?, ?, ?, ?, ?, ?)
    `
  ).run(
    course.id,
    facultyId,
    "Database Revision Notes",
    "Concise notes covering ER modeling, normalization, indexing, and transactions.",
    "/uploads/seed-db-handbook.txt",
    "seed-db-handbook.txt"
  );
}

function seedOutingRequests(studentId) {
  const count = db.prepare("SELECT COUNT(*) AS total FROM outing_requests WHERE student_id = ?").get(studentId);
  if (count.total > 0) {
    return;
  }

  db.prepare(
    `
      INSERT INTO outing_requests (student_id, purpose, destination, outing_date, return_date, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `
  ).run(studentId, "Medical appointment", "City Health Centre", "2026-03-29", "2026-03-29", "pending");
}

function ensurePlacementSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS placement_questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL,
      topic TEXT NOT NULL,
      difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
      question TEXT NOT NULL,
      option_a TEXT NOT NULL,
      option_b TEXT NOT NULL,
      option_c TEXT NOT NULL,
      option_d TEXT NOT NULL,
      correct_option TEXT NOT NULL CHECK (correct_option IN ('A', 'B', 'C', 'D')),
      explanation TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS placement_attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      question_id INTEGER NOT NULL,
      selected_option TEXT NOT NULL CHECK (selected_option IN ('A', 'B', 'C', 'D')),
      is_correct INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE CASCADE,
      FOREIGN KEY (question_id) REFERENCES placement_questions (id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_placement_attempts_student ON placement_attempts (student_id);
    CREATE INDEX IF NOT EXISTS idx_placement_questions_category ON placement_questions (category);
  `);
}

function seedPlacementQuestions() {
  const count = db.prepare("SELECT COUNT(*) AS total FROM placement_questions").get();
  if (count.total > 0) {
    return;
  }

  const insert = db.prepare(
    `
      INSERT INTO placement_questions
        (category, topic, difficulty, question, option_a, option_b, option_c, option_d, correct_option, explanation)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
  );

  for (const item of PLACEMENT_QUESTIONS) {
    insert.run(
      item.category,
      item.topic,
      item.difficulty,
      item.question,
      item.optionA,
      item.optionB,
      item.optionC,
      item.optionD,
      item.correct,
      item.explanation
    );
  }
}

function ensureCommunitySchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'general',
      event_date TEXT NOT NULL,
      event_time TEXT,
      venue TEXT,
      created_by INTEGER,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS complaints (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      category TEXT NOT NULL DEFAULT 'general',
      subject TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
      response TEXT,
      responded_by INTEGER,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT,
      FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE CASCADE,
      FOREIGN KEY (responded_by) REFERENCES users (id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS disciplinary_actions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      action_type TEXT NOT NULL DEFAULT 'warning'
        CHECK (action_type IN ('warning', 'suspension', 'fine', 'note')),
      reason TEXT NOT NULL,
      action_date TEXT NOT NULL,
      remarks TEXT,
      recorded_by INTEGER,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE CASCADE,
      FOREIGN KEY (recorded_by) REFERENCES users (id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS hall_tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      exam_name TEXT NOT NULL,
      subject TEXT NOT NULL,
      exam_date TEXT NOT NULL,
      exam_time TEXT NOT NULL,
      hall TEXT NOT NULL,
      seat_no TEXT NOT NULL,
      created_by INTEGER,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE CASCADE,
      FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_complaints_student ON complaints (student_id);
    CREATE INDEX IF NOT EXISTS idx_disciplinary_student ON disciplinary_actions (student_id);
    CREATE INDEX IF NOT EXISTS idx_hall_tickets_student ON hall_tickets (student_id);
    CREATE INDEX IF NOT EXISTS idx_events_date ON events (event_date);
  `);

  // 'appreciation' was retired from the conduct types; migrate any legacy rows
  // to a neutral 'note' so existing databases stay valid under the new rules.
  db.prepare("UPDATE disciplinary_actions SET action_type = 'note' WHERE action_type = 'appreciation'").run();
}

function seedCommunityData(studentId, adminUserId, facultyUserId) {
  if (db.prepare("SELECT COUNT(*) AS total FROM events").get().total === 0) {
    const insertEvent = db.prepare(
      `INSERT INTO events (title, description, category, event_date, event_time, venue, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    );
    insertEvent.run("Annual Tech Symposium 2026", "A day of technical talks, project expos, and coding contests open to all branches.", "academic", "2026-08-14", "09:30", "Main Auditorium", adminUserId);
    insertEvent.run("Placement Readiness Bootcamp", "Aptitude, group discussion, and mock interview drills led by the placement cell.", "placement", "2026-07-22", "10:00", "Seminar Hall 2", facultyUserId);
    insertEvent.run("Inter-College Cultural Fest", "Music, dance, and drama performances with participation from neighbouring colleges.", "cultural", "2026-09-05", "17:00", "Open Air Theatre", adminUserId);
  }

  if (studentId && db.prepare("SELECT COUNT(*) AS total FROM complaints").get().total === 0) {
    db.prepare(
      `INSERT INTO complaints (student_id, category, subject, description, status, response, responded_by, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      studentId,
      "infrastructure",
      "Projector not working in Lab-201",
      "The projector in Lab-201 has been flickering during afternoon sessions for the past week.",
      "in_progress",
      "Maintenance has been notified and a replacement bulb is on order.",
      adminUserId,
      "2026-07-02T10:15:00"
    );
  }

  if (studentId && db.prepare("SELECT COUNT(*) AS total FROM disciplinary_actions").get().total === 0) {
    db.prepare(
      `INSERT INTO disciplinary_actions (student_id, action_type, reason, action_date, remarks, recorded_by)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(
      studentId,
      "note",
      "Consistently punctual and actively participates in class and lab sessions.",
      "2026-06-20",
      "Positive classroom conduct noted by the mentor.",
      facultyUserId
    );
  }

  if (studentId && db.prepare("SELECT COUNT(*) AS total FROM hall_tickets").get().total === 0) {
    const insertTicket = db.prepare(
      `INSERT INTO hall_tickets (student_id, exam_name, subject, exam_date, exam_time, hall, seat_no, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    );
    insertTicket.run(studentId, "End Semester Examination - Sem 5", "Database Systems (CSE501)", "2026-08-05", "10:00", "Block A - Hall 1", "A-014", adminUserId);
    insertTicket.run(studentId, "End Semester Examination - Sem 5", "Web Engineering (CSE502)", "2026-08-08", "10:00", "Block A - Hall 1", "A-014", adminUserId);
  }
}

async function initializeDatabase() {
  if (db.database) {
    return;
  }

  const database = new Database(databasePath);
  // WAL lets readers run concurrently with a writer (no full-file locking);
  // NORMAL sync + a busy timeout keep it durable without fsync on every commit.
  database.pragma("journal_mode = WAL");
  database.pragma("synchronous = NORMAL");
  database.pragma("foreign_keys = ON");
  database.pragma("busy_timeout = 5000");

  db.attachDatabase(database);

  // Schema creation + seeding run inside a single atomic transaction, so startup
  // either fully succeeds or leaves the database untouched.
  const bootstrap = database.transaction(() => {
    const schema = fs.readFileSync(schemaPath, "utf8");
    db.exec(schema);
    ensureAcademicSchema();
    ensureAcademicSeedData();
    ensurePlacementSchema();
    ensureCommunitySchema();

    // Seed data (demo users with known passwords, sample assignments, etc.)
    // must NEVER run in production — it would create backdoor accounts.
    if (process.env.NODE_ENV !== "production") {
      seedPlacementQuestions();
      ensureSeedUploadFiles();
      ensureSeedUsers();
    }
  });
  bootstrap();
}

// Storage-layer metrics for the diagnostics endpoint: main file size, the WAL
// sidecar size (grows between checkpoints), and the active journal mode.
function getDbDiagnostics() {
  const sizeOf = (filePath) => {
    try {
      return fs.statSync(filePath).size;
    } catch (_error) {
      return 0;
    }
  };

  let journalMode = null;
  let pageCount = null;
  try {
    journalMode = db.database.pragma("journal_mode", { simple: true });
    pageCount = db.database.pragma("page_count", { simple: true });
  } catch (_error) {
    /* database not ready */
  }

  return {
    file: databaseFile,
    sizeBytes: sizeOf(databasePath),
    walBytes: sizeOf(`${databasePath}-wal`),
    journalMode,
    pageCount
  };
}

module.exports = {
  db,
  getUserAccountByEmail,
  getUserProfileById,
  getStudentProfileByUserId,
  getFacultyProfileByUserId,
  getDbDiagnostics,
  initializeDatabase,
  databaseDir
};
