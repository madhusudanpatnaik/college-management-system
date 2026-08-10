
# College Management System

![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=flat-square&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-4.x-000000?style=flat-square&logo=express&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-2563eb?style=flat-square)
![RBAC](https://img.shields.io/badge/Security-RBAC-0f172a?style=flat-square)
![Tests](https://img.shields.io/badge/Tests-103%20passing-22c55e?style=flat-square)
![License](https://img.shields.io/badge/License-Academic%20Use%20Only-dc2626?style=flat-square)

A production-grade, role-based college management system built with **Node.js**, **Express**, **JWT authentication**, and **SQL.js**. Features a clean dark-themed dashboard for Admin, Faculty, and Student roles with 17 dedicated modules covering academics, attendance, assignments, results, fees, timetables, notices, materials, outing workflows, and placement preparation.

---

## Table of Contents

- [Quick Start](#quick-start)
- [Demo Accounts](#demo-accounts)
- [Features by Role](#features-by-role)
- [Modules](#modules)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Authentication & Authorization](#authentication--authorization)
- [API Reference](#api-reference)
- [Testing](#testing)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Security](#security)
- [Future Improvements](#future-improvements)
- [License](#license)

---

## Quick Start

### Prerequisites

- **Node.js 18+** (check with `node -v`)
- **npm** (comes with Node.js)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd college-management-system

# Install dependencies
npm install

# Start the server
npm start
```

The application is now running at **http://localhost:3000**

### Development Mode

```bash
npm run dev    # Uses nodemon for auto-restart on file changes
```

---

## Demo Accounts

The system ships with pre-configured demo accounts for immediate testing. On the login page, click **"Use Demo Access"** to autofill credentials for any role.

| Role | Email | Password | Dashboard Access |
|------|-------|----------|------------------|
| **Admin** | `admin@college.edu` | `Admin@123` | Full system control — students, faculty, academics, fees, timetables, all modules |
| **Faculty** | `faculty@college.edu` | `Faculty@123` | Assigned students, attendance marking, results publishing, assignments, materials |
| **Student** | `student@college.edu` | `Student@123` | Personal dashboard — attendance, results, fees, assignments, outing requests, placement prep |

> **Note:** Demo accounts and the "Use Demo Access" button are automatically hidden when `NODE_ENV=production`. The demo seed data (users, sample courses, assignments, etc.) is also skipped in production to prevent backdoor access.

### Login Flow

1. Navigate to `http://localhost:3000` → redirects to the login page
2. Select your role from the dropdown
3. Enter email and password (or click a demo card to autofill)
4. On successful login, the server returns a **JWT token** and the role-specific dashboard loads
5. The token is stored in `localStorage` and attached to all subsequent API requests via the `Authorization: Bearer` header
6. Session is validated on every page load through `GET /api/me`

### Password Reset Flow

1. Click **"Forgot Password?"** on the login page
2. Enter the account email address
3. In demo mode, the reset link is returned directly in the response
4. Click the reset link → opens the reset password page
5. Enter and confirm the new password (minimum 8 characters)
6. Login with the new credentials

---

## Features by Role

### Admin — Full System Control

| Module | Capabilities |
|--------|-------------|
| **Dashboard** | Overview stats (total students, faculty, open notices, pending outings), fee collection pulse, recent notices feed, pending outing approvals table |
| **Academics** | Create and manage departments, branches, and subjects; assign faculty to subjects; view the full academic hierarchy |
| **Students** | Register new students, view/search all student records, delete students with cascading data cleanup, manage fee records |
| **Faculty** | Register new faculty, view all faculty profiles, update department/branch assignments and salary status |
| **Attendance** | View course-level attendance records across all courses |
| **Exams** | Create exam schedules, view results across all courses and students |
| **Timetable** | Create timetable slots (day, time, room, course, faculty), manage department-level schedules |
| **Fees** | View and update fee records for all students (paid/partial/pending status) |
| **Assignments** | View all assignments across all courses |
| **Materials** | View all uploaded course materials |
| **Notices** | Post notices with audience targeting (all, students, faculty, admins); edit and delete notices |
| **Outing** | View all outing requests, approve or reject any request |
| **Placement Prep** | Manage the question bank (add/delete questions), view cohort-wide analytics and weakest topics |

### Faculty — Teaching & Mentoring

| Module | Capabilities |
|--------|-------------|
| **Dashboard** | Stats (assigned students, subjects, assignments posted, pending outings), subject list, recent notices, uploaded materials table |
| **Students** | View assigned/advisee students |
| **Attendance** | Mark subject-wise attendance (present/absent/late) for students in assigned courses |
| **Exams** | Publish subject-wise results with marks, grades, and remarks |
| **Timetable** | View personal teaching schedule |
| **Assignments** | Create assignments with file attachments, set deadlines, view student submissions |
| **Materials** | Upload and manage course materials (PDFs, documents) |
| **Notices** | Post notices targeted to students mapped to faculty's subjects |
| **Outing** | Review and approve/reject outing requests for assigned advisee students |
| **Placement Prep** | Manage the question bank, view analytics |

### Student — Academic Life

| Module | Capabilities |
|--------|-------------|
| **Dashboard** | Overall attendance percentage, open assignments count, study materials count, fee balance; academic profile card with mentor info; assignment status; latest results; notice & outing summary |
| **Attendance** | View personal subject-wise attendance with percentage breakdowns |
| **Results** | View published results with grades, marks, and exam type breakdowns |
| **Timetable** | View personal class schedule (auto-resolved from assigned faculty or course track) |
| **Fees** | View semester-wise fee status (total, paid, balance, due date) |
| **Assignments** | View assigned work, upload submissions, track submission status (submitted/late) |
| **Materials** | Browse and download course materials |
| **Notices** | View notices targeted to student's department and semester |
| **Outing** | Submit outing requests (purpose, destination, dates), track approval status and faculty comments |
| **Placement Prep** | Take practice quizzes, get instant explanations for wrong answers, view topic-wise performance with a readiness score and personalized study tips |

---

## Modules

### 1. Academics Management
Hierarchical structure: **Department → Branch → Subject → Faculty Assignment**. Admins can create departments (e.g., CSE, ECE), branches within departments, and subjects with semester, credits, and optional faculty assignment.

### 2. Attendance Tracking
Faculty mark daily attendance per course with three statuses: `present`, `absent`, `late`. Students see their overall and per-subject attendance percentages.

### 3. Exam Results
Faculty publish exam results with marks, maximum marks, auto-calculated grades (S/A/B/C/D/E/F), and optional remarks. Supports multiple exam types (midterm, final, quiz, etc.).

### 4. Timetable Management
Admins create timetable slots with day, start/end time, room number, course, and faculty assignment. Students see their schedule auto-resolved based on their advisor or department/branch/semester.

### 5. Fee Management
Tracks per-student, per-semester fees with total amount, paid amount, balance, due dates, and status (`paid`, `partial`, `pending`). Admins can update payment records.

### 6. Assignment & Submission Workflow
Faculty create assignments with titles, descriptions, deadlines, and optional file attachments. Students upload submissions. The system tracks submission status and whether it was submitted on time or late.

### 7. Course Materials
Faculty upload study materials (PDFs, documents) per subject. Students browse and download materials for their enrolled courses.

### 8. Notice Board
Role-aware notice system with audience targeting:
- **Admin notices**: Can target `all`, `students`, `faculty`, or `admins`
- **Faculty notices**: Auto-targeted to students in the faculty's subjects
- **Student view**: Filtered by department, branch, and semester mapping

### 9. Outing Request Workflow
Students submit outing requests with purpose, destination, and dates. Faculty advisors review and approve/reject with optional comments. Admins can manage all requests.

### 10. Placement Preparation
A built-in practice module to help students get placement-ready:
- **5 categories**: Aptitude, Logical Reasoning, Verbal Ability, Computer Science, Programming
- **3 difficulty levels**: Easy, Medium, Hard
- **Topic-filtered quizzes** with configurable question count (up to 20)
- **Every wrong answer is explained** with the correct answer revealed post-submission
- **Personalized feedback**: Topic-by-topic weak areas, strengths, readiness score, and actionable study tips
- **Anti-cheat**: Correct answers and explanations are **never sent** to the quiz client before submission
- **Admin/faculty analytics**: Cohort-wide performance, category breakdowns, weakest topics

### 11. Student-Faculty Relationships
Admins and faculty can assign students to faculty advisors. The assignment drives timetable resolution, outing request routing, and notice targeting.

### 12. Events
Upcoming and past campus events (academic, cultural, sports, placement, general). Admins and faculty create/edit events with date, time, and venue; all roles view them. Admins can delete.

### 13. Student Complaints
Students raise categorised complaints and track status (open → in progress → resolved). Admins and faculty view all complaints and post responses that are visible to the student.

### 14. Conduct / Disciplinary Records
Admins and faculty record conduct entries (appreciation, warning, note, fine, suspension) against a student with reason, date, and remarks. Records are **visible to the student (read-only) and to teachers**. Admins can delete.

### 15. Hall Tickets
Admins issue exam hall tickets (exam, subject, date, time, hall, seat) to students. Students view a **printable hall-ticket card**; faculty can view issued tickets.

### 16. Digital ID Card
Every user has a **My Profile** page rendering a printable digital identity card — students get roll number, registration, branch, semester, and section; faculty get employee code and designation.

### 17. About the College
Institutional profile (vision, mission, accreditation, contact) combined with **live counts** of departments, branches, students, and upcoming events.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Runtime** | Node.js 18+ |
| **Backend Framework** | Express.js 4.x |
| **Authentication** | JSON Web Tokens (jsonwebtoken), bcryptjs |
| **Database** | SQL.js (SQLite via WASM, persisted to `database/cms.db`) |
| **Frontend** | HTML5, CSS3, Vanilla JavaScript (single `app.js` — 3,800+ lines) |
| **Security** | Helmet (HSTS, CSP, XSS protection), CORS, express-rate-limit |
| **File Uploads** | Multer (10 MB limit, safe filename sanitization) |
| **Testing** | Jest 30 + Supertest |
| **Development** | nodemon (auto-restart), dotenv (optional env loading) |
| **Containerization** | Docker (Alpine-based, non-root, health check) |

---

## Project Structure

```text
college-management-system/
├── backend/
│   ├── __tests__/
│   │   └── api.test.js              # 103 automated API tests
│   ├── config/
│   │   ├── auth.js                  # JWT configuration and secret management
│   │   ├── db.js                    # Database driver, schema, migrations, seed data
│   │   └── placementData.js         # Placement question bank and topic tips
│   ├── middleware/
│   │   ├── authMiddleware.js        # JWT verification and user injection
│   │   ├── roleMiddleware.js        # Role-based access control (RBAC)
│   │   └── upload.js                # Multer file upload configuration
│   ├── routes/
│   │   ├── academicRoutes.js        # Departments, branches, subjects, faculty assignment
│   │   ├── assignmentRoutes.js      # CRUD for assignments with file attachments
│   │   ├── attendanceRoutes.js      # Mark and query attendance
│   │   ├── authRoutes.js            # Login, forgot/reset password, session (/me)
│   │   ├── facultyRoutes.js         # Faculty CRUD, profile, courses, timetable
│   │   ├── materialRoutes.js        # Upload and serve course materials
│   │   ├── noticeRoutes.js          # Role-aware notice CRUD
│   │   ├── outingRoutes.js          # Outing request submission and review
│   │   ├── placementRoutes.js       # Quiz, submission, analytics, question bank
│   │   ├── resultRoutes.js          # Exam scheduling and result publishing
│   │   ├── studentRelationshipRoutes.js  # Student-faculty advisor assignment
│   │   ├── studentRoutes.js         # Student CRUD, profile, fees, courses
│   │   └── submissionRoutes.js      # Assignment submission upload and listing
│   ├── services/
│   │   └── studentFacultyService.js # Business logic for student-faculty relationships
│   ├── utils/
│   │   ├── authorization.js         # Shared authorization helpers (facultyOwnsCourse)
│   │   └── validation.js            # Input validation patterns (email, etc.)
│   ├── uploads/                     # Runtime file storage (gitignored)
│   └── server.js                    # Express app, middleware stack, graceful shutdown
├── database/
│   ├── cms.sql                      # Base schema (16 tables with constraints)
│   └── cms.db                       # Runtime SQLite database (gitignored)
├── frontend/
│   ├── css/
│   │   └── styles.css               # Full design system with dark theme
│   ├── js/
│   │   ├── app.js                   # Single-page app logic (3,800+ lines)
│   │   └── motion.js                # Scroll-reveal animations (desktop only)
│   ├── login.html                   # Auth page with demo credential cards
│   ├── dashboard.html               # Role-adaptive dashboard
│   ├── academics.html               # Department/branch/subject management
│   ├── students.html                # Student records
│   ├── faculty.html                 # Faculty records
│   ├── attendance.html              # Attendance marking and viewing
│   ├── exams.html                   # Exam scheduling and results
│   ├── timetable.html               # Class schedule
│   ├── fees.html                    # Fee records
│   ├── assignments.html             # Assignment management
│   ├── materials.html               # Course materials
│   ├── notices.html                 # Notice board
│   ├── outing.html                  # Outing request workflow
│   ├── placement.html               # Placement preparation quizzes
│   ├── forgot-password.html         # Password reset request
│   ├── reset-password.html          # Password reset form
│   └── favicon.svg                  # App icon
├── .env.example                     # Environment variable documentation
├── .gitignore
├── Dockerfile                       # Production container (Alpine, non-root)
├── package.json
├── LICENSE
└── README.md
```

---

## Authentication & Authorization

### JWT-Based Authentication

- Login issues a signed JWT token (default: 8-hour expiry)
- Token contains `userId` and `role` claims
- Every protected API request must include `Authorization: Bearer <token>`
- The `GET /api/me` endpoint validates the token and returns the full user profile

### Role-Based Access Control (RBAC)

Every route is protected by two middleware layers:

1. **`authMiddleware`** — Verifies the JWT signature and expiration, attaches the full user profile to `req.user`
2. **`roleMiddleware(...allowedRoles)`** — Checks if `req.user.role` is in the allowed list; returns `403 Forbidden` otherwise

### Access Matrix (Verified by 103 Automated Tests)

| Endpoint | Admin | Faculty | Student |
|----------|:-----:|:-------:|:-------:|
| `GET /api/me` | ✅ | ✅ | ✅ |
| `GET /api/students` | ✅ | ❌ | ❌ |
| `GET /api/students/assigned` | ❌ | ✅ | ❌ |
| `GET /api/students/me/profile` | ❌ | ❌ | ✅ |
| `GET /api/faculty` | ✅ | ❌ | ❌ |
| `GET /api/faculty/courses` | ✅ | ✅ | ❌ |
| `GET /api/attendance/my` | ❌ | ❌ | ✅ |
| `GET /api/attendance/course/:id` | ✅ | ✅ | ❌ |
| `GET /api/results/my` | ❌ | ❌ | ✅ |
| `GET /api/results` | ✅ | ✅ | ❌ |
| `GET /api/assignments` | ✅ | ✅ | ✅ |
| `GET /api/materials` | ✅ | ✅ | ✅ |
| `GET /api/notices` | ✅ | ✅ | ✅ |
| `GET /api/outing` | ✅ | ✅ | ❌ |
| `GET /api/outing/my` | ❌ | ❌ | ✅ |
| `GET /api/placement/quiz` | ❌ | ❌ | ✅ |
| `GET /api/placement/overview` | ❌ | ❌ | ✅ |
| `GET /api/placement/questions` | ✅ | ✅ | ❌ |
| `GET /api/placement/analytics` | ✅ | ✅ | ❌ |
| `GET /api/academics/*` | ✅ | ❌ | ❌ |
| `GET /api/students/fees` | ✅ | ❌ | ❌ |
| `GET /api/students/me/fees` | ❌ | ❌ | ✅ |

---

## API Reference

### Public Endpoints (No Authentication Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Liveness probe — returns status, uptime, and database connectivity |
| `GET` | `/api/config` | Frontend configuration — reports whether demo mode is active |
| `POST` | `/api/login` | Authenticate with email/password → returns JWT token and role |
| `POST` | `/api/forgot-password` | Request a password reset link |
| `POST` | `/api/reset-password` | Reset password using a valid token |

### Protected Endpoints (Require `Authorization: Bearer <token>`)

| Module | Routes | Methods |
|--------|--------|---------|
| **Session** | `/api/me` | `GET` |
| **Students** | `/api/students`, `/api/students/me/*`, `/api/students/assigned`, `/api/students/fees` | `GET`, `POST`, `PUT`, `DELETE` |
| **Faculty** | `/api/faculty`, `/api/faculty/profile`, `/api/faculty/courses`, `/api/faculty/timetable`, `/api/faculty/assigned-students` | `GET`, `POST`, `PUT`, `DELETE` |
| **Academics** | `/api/academics/departments`, `/api/academics/branches`, `/api/academics/subjects`, `/api/academics/overview` | `GET`, `POST`, `PUT` |
| **Attendance** | `/api/attendance/my`, `/api/attendance/course/:id` | `GET`, `POST` |
| **Results** | `/api/results`, `/api/results/my`, `/api/results/exams` | `GET`, `POST` |
| **Assignments** | `/api/assignments` | `GET`, `POST` |
| **Submissions** | `/api/submissions`, `/api/submissions/my` | `GET`, `POST` |
| **Materials** | `/api/materials` | `GET`, `POST`, `DELETE` |
| **Notices** | `/api/notices` | `GET`, `POST`, `PUT`, `DELETE` |
| **Outing** | `/api/outing`, `/api/outing/my` | `GET`, `POST`, `PUT` |
| **Placement** | `/api/placement/overview`, `/api/placement/quiz`, `/api/placement/submit`, `/api/placement/questions`, `/api/placement/analytics` | `GET`, `POST`, `DELETE` |
| **Relationships** | `/api/assign-student`, `/api/timetable/:studentId` | `GET`, `POST` |

---

## Testing

The project includes a comprehensive automated test suite (103 tests) using **Jest** and **Supertest**:

```bash
npm test
```

### Test Coverage

| Category | Tests | Description |
|----------|:-----:|-------------|
| **Health Probe** | 1 | Public `/api/health` returns 200 |
| **Authentication** | 4 | Valid login, wrong password, missing credentials, malformed email |
| **Session Validation** | 3 | Token required, invalid token rejected, valid token returns profile |
| **RBAC** | 5 | Admin/student/faculty access enforcement on protected routes |
| **Placement Prep** | 7 | Quiz anti-cheat, submission grading, question bank access, role restrictions |
| **Authorization Matrix** | 62 | Every GET endpoint × 3 roles + unauthenticated = full coverage |

Tests run against an isolated `cms.test.db` database, so they never touch demo or production data.

---

## Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Required | Default | Description |
|----------|:--------:|---------|-------------|
| `JWT_SECRET` | **Production** | Insecure fallback (dev only) | Secret key for signing JWT tokens. Generate with: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `PORT` | No | `3000` | HTTP server port |
| `NODE_ENV` | No | `development` | Set to `production` to enable HSTS, disable demo seed data, hide demo UI, and enforce `JWT_SECRET` |
| `CORS_ORIGINS` | No | `*` (dev) / blocked (prod) | Comma-separated allowlist of cross-origin frontend domains |

---

## Deployment

### Docker

A production `Dockerfile` is included — Alpine-based, non-root user, with a built-in health check:

```bash
# Build the image
docker build -t college-management-system .

# Run in production
docker run -p 3000:3000 \
  -e JWT_SECRET="$(openssl rand -hex 32)" \
  -e NODE_ENV=production \
  college-management-system
```

### Health Check

```
GET /api/health
```

Returns `200 OK` with database connectivity status:

```json
{
  "status": "ok",
  "uptime": 3456.78,
  "database": "connected"
}
```

Returns `503 Service Unavailable` if the database is unreachable. This is the
lightweight, public liveness probe intended for load balancers.

### Diagnostics (admin-only)

```
GET /api/diagnostics
```

Deeper operational metrics, gated to `admin` (memory/disk figures should not be
public): process memory, event-loop delay (mean/p99/max — a signal of whether
synchronous DB work is blocking the loop), database file + WAL sizes and journal
mode, `uploads/` footprint, free/total disk on the DB volume, and live SSE
connection count + backend (`memory` or `redis`).

### Scaling notes

- **Database writes** — SQLite runs in WAL mode (concurrent reads) with a 5s
  busy timeout. Under multi-writer contention that exceeds the timeout, the API
  returns `503` with `Retry-After` (never a bare 500). For very high write
  concurrency, migrate to PostgreSQL.
- **Real-time across instances** — for a load-balanced, multi-node deployment,
  set `REDIS_URL` and `npm install ioredis`; SSE events then fan out across all
  instances via Redis pub/sub. Single-node needs nothing (in-memory delivery).

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Set a strong `JWT_SECRET` (the server **refuses to start** without one in production)
- [ ] Deploy behind a TLS-terminating reverse proxy (nginx, Caddy, or cloud LB)
- [ ] Set `CORS_ORIGINS` if the frontend is hosted on a separate domain
- [ ] Verify `/api/health` returns `{"status":"ok"}` after deployment
- [ ] Confirm demo credentials are not accessible on the login page

### Graceful Shutdown

The server handles `SIGTERM` and `SIGINT` signals gracefully — persists the database to disk and drains active connections before exiting (10-second timeout).

---

## Security

### Implemented Protections

| Protection | Implementation |
|-----------|---------------|
| **JWT Authentication** | Signed tokens with configurable expiry, verified on every request |
| **RBAC** | Two-layer middleware (auth + role check) on every route |
| **Password Hashing** | bcryptjs with salt rounds (cost factor 10) |
| **Rate Limiting** | 20 login attempts / 15 min per IP; 500 general API calls / 15 min per IP |
| **HSTS** | Enabled in production (1 year, includeSubDomains, preload-ready) |
| **Content Security Policy** | Strict CSP allowing only self-hosted assets and Google Fonts |
| **SQL Injection Prevention** | Parameterized queries throughout; identifier validation for DDL operations |
| **XSS Protection** | `escapeHtml()` output encoding on all user-generated content in templates |
| **CSRF** | Structurally prevented — auth uses Bearer tokens (not cookies) |
| **File Upload Security** | 10 MB limit, safe filename sanitization (`<timestamp>-<prefix>-<originalname>`) |
| **Authenticated File Access** | `/uploads` directory requires valid JWT token |
| **Account Deactivation** | `is_active` flag enforced on login and session validation |
| **Demo Data Isolation** | Seed accounts, sample data, and demo UI hidden in production |
| **User Enumeration Prevention** | Forgot-password returns identical responses in production |
| **Helmet** | Sets `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, and other security headers |

---

## Database

### Schema (16 Tables)

The schema is bootstrapped from `database/cms.sql` with runtime migrations handled in `backend/config/db.js`:

| Table | Purpose |
|-------|---------|
| `departments` | Academic departments (CSE, ECE, BBA, etc.) |
| `branches` | Branches within departments |
| `users` | All user accounts with role, email, password hash, and `is_active` flag |
| `faculty` | Faculty profiles linked to users |
| `students` | Student profiles with roll number, registration, semester, section, advisor |
| `courses` | Subjects with department, branch, faculty, semester, credits |
| `attendance` | Per-student, per-course, per-date attendance records |
| `results` | Exam results with marks, grades, and exam type |
| `fees` | Per-student, per-semester fee records |
| `timetable` | Class schedule slots (day, time, room, course, faculty) |
| `notices` | Notice board entries with audience targeting |
| `assignments` | Faculty-created assignments with deadlines and attachments |
| `submissions` | Student assignment uploads with timestamp tracking |
| `materials` | Uploaded course study materials |
| `outing_requests` | Student outing requests with review workflow |
| `placement_questions` | Placement quiz question bank |
| `placement_attempts` | Student quiz attempt records for analytics |

### Persistence

- The database is loaded into memory via **sql.js** (SQLite compiled to WASM)
- Changes are automatically persisted to `database/cms.db` on every mutation
- Full database is flushed on graceful shutdown

---

## Future Improvements

- [ ] Expand automated test coverage to mutating endpoints and UI workflows
- [ ] Add audit logs and activity history for compliance
- [ ] Add pagination, filtering, and CSV export for large datasets
- [ ] Integrate email delivery for password resets and notice notifications
- [ ] Migrate to `better-sqlite3` (native driver with WAL mode) for higher write throughput
- [ ] Add token revocation / refresh token pattern for secure logout
- [ ] Add per-account login lockout after repeated failed attempts
- [ ] Add structured logging with `pino` or `winston`
- [ ] Add OpenAPI / Swagger documentation
- [ ] Split the monolithic `app.js` frontend into modular components
- [ ] Add CI/CD pipeline configuration

---

## SEO and Repository Optimization

### Suggested Repository Name

`college-management-system-role-based`

### Suggested GitHub Description

Role-based college management system built with Node.js, Express, JWT authentication, SQL.js, and a clean admin, faculty, and student dashboard.

### Suggested Topics

`college-management-system`, `student-management-system`, `nodejs`, `express`, `jwt-authentication`, `role-based-access-control`, `sqljs`, `sqlite`, `vanilla-javascript`, `admin-dashboard`, `faculty-dashboard`, `student-dashboard`, `attendance-management`, `assignment-management`, `education-software`, `placement-preparation`

---

## License

This project is distributed under the Personal Academic Use Only License. See the `LICENSE` file for usage restrictions and credit requirements.
