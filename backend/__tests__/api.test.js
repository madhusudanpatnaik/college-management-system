const request = require("supertest");
const { app, initializeDatabase } = require("../server");

// One-time DB bootstrap (WASM init + full seed + bcrypt) can take a few seconds
// under load, so give Jest's hooks and tests a realistic timeout.
jest.setTimeout(30000);

const ADMIN = { email: "admin@college.edu", password: "Admin@123" };
const FACULTY = { email: "faculty@college.edu", password: "Faculty@123" };
const STUDENT = { email: "student@college.edu", password: "Student@123" };

let adminToken;
let facultyToken;
let studentToken;
const tokens = {};

beforeAll(async () => {
  await initializeDatabase();

  adminToken = (await request(app).post("/api/login").send(ADMIN)).body.token;
  facultyToken = (await request(app).post("/api/login").send(FACULTY)).body.token;
  studentToken = (await request(app).post("/api/login").send(STUDENT)).body.token;

  tokens.admin = adminToken;
  tokens.faculty = facultyToken;
  tokens.student = studentToken;
}, 30000);

describe("Health", () => {
  test("GET /api/health is public and reports ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });
});

describe("Authentication", () => {
  test("valid admin login returns a token and role", async () => {
    const res = await request(app).post("/api/login").send(ADMIN);
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
    expect(res.body.role).toBe("admin");
  });

  test("wrong password is rejected with 401", async () => {
    const res = await request(app)
      .post("/api/login")
      .send({ email: ADMIN.email, password: "definitely-wrong" });
    expect(res.status).toBe(401);
  });

  test("missing credentials return 400", async () => {
    const res = await request(app).post("/api/login").send({ email: ADMIN.email });
    expect(res.status).toBe(400);
  });

  test("malformed email returns 400", async () => {
    const res = await request(app)
      .post("/api/login")
      .send({ email: "not-an-email", password: "whatever" });
    expect(res.status).toBe(400);
  });
});

describe("Session (/api/me)", () => {
  test("requires a token", async () => {
    const res = await request(app).get("/api/me");
    expect(res.status).toBe(401);
  });

  test("rejects an invalid token", async () => {
    const res = await request(app).get("/api/me").set("Authorization", "Bearer not.a.jwt");
    expect(res.status).toBe(401);
  });

  test("returns the profile for a valid token", async () => {
    const res = await request(app).get("/api/me").set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(ADMIN.email);
    expect(res.body.user.role).toBe("admin");
  });
});

describe("Role-based access control", () => {
  test("admin can list students", async () => {
    const res = await request(app).get("/api/students").set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });

  test("student cannot list students (admin-only)", async () => {
    const res = await request(app)
      .get("/api/students")
      .set("Authorization", `Bearer ${studentToken}`);
    expect(res.status).toBe(403);
  });

  test("student can read own profile", async () => {
    const res = await request(app)
      .get("/api/students/me/profile")
      .set("Authorization", `Bearer ${studentToken}`);
    expect(res.status).toBe(200);
  });

  test("admin cannot use the student-only profile route", async () => {
    const res = await request(app)
      .get("/api/students/me/profile")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(403);
  });

  test("unauthenticated request to a protected route is 401", async () => {
    const res = await request(app).get("/api/students");
    expect(res.status).toBe(401);
  });
});

describe("Placement preparation", () => {
  test("quiz delivers questions WITHOUT leaking the correct answer or explanation", async () => {
    const res = await request(app)
      .get("/api/placement/quiz?limit=3")
      .set("Authorization", `Bearer ${studentToken}`);
    expect(res.status).toBe(200);
    expect(res.body.questions.length).toBeGreaterThan(0);
    const q = res.body.questions[0];
    expect(q.options).toBeTruthy();
    expect(q.options.A).toBeTruthy();
    expect(q.correct_option).toBeUndefined();
    expect(q.correctOption).toBeUndefined();
    expect(q.explanation).toBeUndefined();
  });

  test("overview returns categories, summary, and feedback for a student", async () => {
    const res = await request(app)
      .get("/api/placement/overview")
      .set("Authorization", `Bearer ${studentToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.categories)).toBe(true);
    expect(res.body.summary).toBeTruthy();
    expect(res.body.feedback).toHaveProperty("readiness");
  });

  test("submit grades answers and returns explanations + the correct answer", async () => {
    const quiz = await request(app)
      .get("/api/placement/quiz?limit=2")
      .set("Authorization", `Bearer ${studentToken}`);
    const answers = quiz.body.questions.map((q) => ({ questionId: q.id, selectedOption: "A" }));
    const res = await request(app)
      .post("/api/placement/submit")
      .set("Authorization", `Bearer ${studentToken}`)
      .send({ answers });
    expect(res.status).toBe(200);
    expect(res.body.results.length).toBe(answers.length);
    expect(res.body.results[0]).toHaveProperty("explanation");
    expect(res.body.results[0]).toHaveProperty("correctOption");
    expect(res.body.score).toHaveProperty("accuracy");
    expect(res.body.feedback).toHaveProperty("readiness");
  });

  test("submit rejects an invalid option letter with 400", async () => {
    const quiz = await request(app)
      .get("/api/placement/quiz?limit=1")
      .set("Authorization", `Bearer ${studentToken}`);
    const res = await request(app)
      .post("/api/placement/submit")
      .set("Authorization", `Bearer ${studentToken}`)
      .send({ answers: [{ questionId: quiz.body.questions[0].id, selectedOption: "Z" }] });
    expect(res.status).toBe(400);
  });

  test("students cannot access the question bank (admin/faculty only)", async () => {
    const res = await request(app)
      .get("/api/placement/questions")
      .set("Authorization", `Bearer ${studentToken}`);
    expect(res.status).toBe(403);
  });

  test("admins cannot take a student practice quiz", async () => {
    const res = await request(app).get("/api/placement/quiz").set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(403);
  });

  test("admin can list the question bank including answer keys", async () => {
    const res = await request(app)
      .get("/api/placement/questions")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.questions.length).toBeGreaterThan(0);
    expect(res.body.questions[0]).toHaveProperty("correct_option");
  });
});

// Full role × endpoint authorization matrix. Every read endpoint is exercised
// for all three roles: allowed roles must get 2xx, everyone else must get 403.
describe("Authorization matrix (every GET endpoint × every role)", () => {
  const ENDPOINTS = [
    ["/api/me", ["admin", "faculty", "student"]],
    ["/api/academics/departments", ["admin"]],
    ["/api/academics/branches?departmentId=1", ["admin"]],
    ["/api/academics/overview", ["admin"]],
    ["/api/assignments", ["admin", "faculty", "student"]],
    ["/api/attendance/my", ["student"]],
    ["/api/attendance/course/1", ["faculty", "admin"]],
    ["/api/faculty", ["admin"]],
    ["/api/faculty/assigned-students", ["faculty", "admin"]],
    ["/api/faculty/courses", ["faculty", "admin"]],
    ["/api/faculty/timetable", ["faculty", "admin"]],
    ["/api/faculty/profile", ["faculty", "admin"]],
    ["/api/materials", ["admin", "faculty", "student"]],
    ["/api/notices", ["admin", "faculty", "student"]],
    ["/api/outing/my", ["student"]],
    ["/api/outing", ["faculty", "admin"]],
    ["/api/placement/overview", ["student"]],
    ["/api/placement/quiz?limit=2", ["student"]],
    ["/api/placement/questions", ["admin", "faculty"]],
    ["/api/placement/analytics", ["admin", "faculty"]],
    ["/api/results/exams", ["admin", "faculty", "student"]],
    ["/api/results/my", ["student"]],
    ["/api/results", ["faculty", "admin"]],
    ["/api/students", ["admin"]],
    ["/api/students/assigned", ["faculty"]],
    ["/api/students/me/profile", ["student"]],
    ["/api/students/me/courses", ["student"]],
    ["/api/students/me/timetable", ["student"]],
    ["/api/students/me/fees", ["student"]],
    ["/api/students/fees", ["admin"]],
    ["/api/timetable/1", ["admin", "faculty", "student"]],
    ["/api/events", ["admin", "faculty", "student"]],
    ["/api/complaints", ["admin", "faculty"]],
    ["/api/complaints/my", ["student"]],
    ["/api/disciplinary", ["admin", "faculty"]],
    ["/api/disciplinary/my", ["student"]],
    ["/api/hall-tickets", ["admin", "faculty"]],
    ["/api/hall-tickets/my", ["student"]],
    ["/api/college/info", ["admin", "faculty", "student"]]
  ];

  const ROLES = ["admin", "faculty", "student"];

  ENDPOINTS.forEach(([endpoint, allowed]) => {
    test(`${endpoint} enforces ${allowed.join("/")}`, async () => {
      for (const role of ROLES) {
        const res = await request(app).get(endpoint).set("Authorization", `Bearer ${tokens[role]}`);
        if (allowed.includes(role)) {
          expect(res.status).toBeGreaterThanOrEqual(200);
          expect(res.status).toBeLessThan(300);
        } else {
          expect(res.status).toBe(403);
        }
      }
    });

    test(`${endpoint} rejects unauthenticated requests`, async () => {
      const res = await request(app).get(endpoint);
      expect(res.status).toBe(401);
    });
  });
});

describe("Community features (events, complaints, conduct, hall tickets)", () => {
  let studentId;

  beforeAll(async () => {
    const me = await request(app).get("/api/me").set("Authorization", `Bearer ${studentToken}`);
    studentId = me.body.user.studentProfile.id;
  });

  test("all roles can read events; only staff can create", async () => {
    for (const role of ["admin", "faculty", "student"]) {
      const res = await request(app).get("/api/events").set("Authorization", `Bearer ${tokens[role]}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.events)).toBe(true);
    }
    const created = await request(app)
      .post("/api/events")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ title: "Test Fest", description: "desc", category: "cultural", eventDate: "2026-12-01", eventTime: "10:00", venue: "Hall" });
    expect(created.status).toBe(201);

    const blocked = await request(app)
      .post("/api/events")
      .set("Authorization", `Bearer ${studentToken}`)
      .send({ title: "x", description: "y", eventDate: "2026-12-01" });
    expect(blocked.status).toBe(403);
  });

  test("student raises a complaint; staff responds", async () => {
    const raised = await request(app)
      .post("/api/complaints")
      .set("Authorization", `Bearer ${studentToken}`)
      .send({ category: "general", subject: "Test complaint", description: "details here" });
    expect(raised.status).toBe(201);

    const mine = await request(app).get("/api/complaints/my").set("Authorization", `Bearer ${studentToken}`);
    expect(mine.status).toBe(200);
    expect(mine.body.complaints.length).toBeGreaterThan(0);

    const responded = await request(app)
      .put(`/api/complaints/${raised.body.id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "resolved", response: "Handled" });
    expect(responded.status).toBe(200);

    const badStatus = await request(app)
      .put(`/api/complaints/${raised.body.id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "not-a-status" });
    expect(badStatus.status).toBe(400);
  });

  test("staff record conduct; student sees it read-only", async () => {
    const recorded = await request(app)
      .post("/api/disciplinary")
      .set("Authorization", `Bearer ${facultyToken}`)
      .send({ studentId, actionType: "note", reason: "Test note", actionDate: "2026-07-01" });
    expect(recorded.status).toBe(201);

    const mine = await request(app).get("/api/disciplinary/my").set("Authorization", `Bearer ${studentToken}`);
    expect(mine.status).toBe(200);
    expect(mine.body.records.length).toBeGreaterThan(0);

    const blocked = await request(app)
      .post("/api/disciplinary")
      .set("Authorization", `Bearer ${studentToken}`)
      .send({ studentId, actionType: "note", reason: "x", actionDate: "2026-07-01" });
    expect(blocked.status).toBe(403);
  });

  test("admin issues a hall ticket; student views it; faculty cannot issue", async () => {
    const issued = await request(app)
      .post("/api/hall-tickets")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ studentId, examName: "Test Exam", subject: "Test Subject", examDate: "2026-08-20", examTime: "10:00", hall: "Hall 1", seatNo: "A-01" });
    expect(issued.status).toBe(201);

    const mine = await request(app).get("/api/hall-tickets/my").set("Authorization", `Bearer ${studentToken}`);
    expect(mine.status).toBe(200);
    expect(mine.body.tickets.length).toBeGreaterThan(0);

    const blocked = await request(app)
      .post("/api/hall-tickets")
      .set("Authorization", `Bearer ${facultyToken}`)
      .send({ studentId, examName: "x", subject: "y", examDate: "2026-08-20", examTime: "10:00", hall: "h", seatNo: "1" });
    expect(blocked.status).toBe(403);
  });

  test("college info returns profile and live stats", async () => {
    const res = await request(app).get("/api/college/info").set("Authorization", `Bearer ${studentToken}`);
    expect(res.status).toBe(200);
    expect(res.body.profile.name).toBeTruthy();
    expect(typeof res.body.stats.branches).toBe("number");
  });
});

describe("API completeness & real-time", () => {
  let studentId;

  beforeAll(async () => {
    const me = await request(app).get("/api/me").set("Authorization", `Bearer ${studentToken}`);
    studentId = me.body.user.studentProfile.id;
  });

  test("admin can delete a complaint; faculty cannot", async () => {
    const raised = await request(app)
      .post("/api/complaints")
      .set("Authorization", `Bearer ${studentToken}`)
      .send({ subject: "to delete", description: "x" });
    const byFaculty = await request(app)
      .delete(`/api/complaints/${raised.body.id}`)
      .set("Authorization", `Bearer ${facultyToken}`);
    expect(byFaculty.status).toBe(403);
    const byAdmin = await request(app)
      .delete(`/api/complaints/${raised.body.id}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(byAdmin.status).toBe(200);
  });

  test("staff can edit a conduct record", async () => {
    const created = await request(app)
      .post("/api/disciplinary")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ studentId, actionType: "warning", reason: "orig", actionDate: "2026-07-01" });
    const edited = await request(app)
      .put(`/api/disciplinary/${created.body.id}`)
      .set("Authorization", `Bearer ${facultyToken}`)
      .send({ actionType: "note", reason: "edited", actionDate: "2026-07-02" });
    expect(edited.status).toBe(200);
  });

  test("'appreciation' is no longer an accepted conduct type (coerced away)", async () => {
    const created = await request(app)
      .post("/api/disciplinary")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ studentId, actionType: "appreciation", reason: "x", actionDate: "2026-07-01" });
    expect(created.status).toBe(201);
    const all = await request(app).get("/api/disciplinary").set("Authorization", `Bearer ${adminToken}`);
    const record = all.body.records.find((r) => r.id === created.body.id);
    expect(record.action_type).not.toBe("appreciation");
  });

  test("admin can edit a hall ticket", async () => {
    const issued = await request(app)
      .post("/api/hall-tickets")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ studentId, examName: "E", subject: "S", examDate: "2026-08-01", examTime: "10:00", hall: "H1", seatNo: "1" });
    const edited = await request(app)
      .put(`/api/hall-tickets/${issued.body.id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ examName: "E2", subject: "S2", examDate: "2026-08-02", examTime: "11:00", hall: "H2", seatNo: "2" });
    expect(edited.status).toBe(200);
  });

  test("real-time SSE stream rejects unauthenticated connections", async () => {
    const res = await request(app).get("/api/realtime");
    expect(res.status).toBe(401);
  });
});
