const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");

const authMiddleware = require("../middleware/authMiddleware");
const { db, getUserAccountByEmail, getUserProfileById } = require("../config/db");
const { JWT_SECRET, JWT_EXPIRES_IN } = require("../config/auth");
const { emailPattern, validatePassword } = require("../utils/validation");

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: "Too many login attempts, please try again after 15 minutes." }
});

// Throttle the password-reset endpoints to blunt token brute-forcing and
// forgot-password email spam.
const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Too many password reset attempts, please try again after 15 minutes." }
});

// Reset tokens are stored hashed, so a database leak does not hand out working
// tokens. The raw token goes only to the user (via the reset link/email).
function hashResetToken(token) {
  return crypto.createHash("sha256").update(String(token)).digest("hex");
}

function getRedirectPage(role) {
  return {
    admin: "dashboard.html",
    faculty: "dashboard.html",
    student: "dashboard.html"
  }[role];
}

function buildAuthPayload(user) {
  return {
    id: user.id,
    role: user.role,
    fullName: user.fullName,
    email: user.email,
    departmentName: user.departmentName,
    studentProfile: user.studentProfile,
    facultyProfile: user.facultyProfile
  };
}

router.post("/login", authLimiter, (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  if (!emailPattern.test(String(email).trim())) {
    return res.status(400).json({ message: "Please enter a valid email address." });
  }

  const userAccount = getUserAccountByEmail(String(email).trim().toLowerCase());
  if (!userAccount) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  const passwordMatches = bcrypt.compareSync(password, userAccount.password_hash);
  if (!passwordMatches) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  const userProfile = getUserProfileById(userAccount.id);
  const token = jwt.sign({ userId: userAccount.id, role: userAccount.role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });

  return res.json({
    message: "Login successful.",
    token,
    role: userAccount.role,
    redirectTo: getRedirectPage(userAccount.role),
    user: buildAuthPayload(userProfile)
  });
});

router.post("/forgot-password", passwordResetLimiter, (req, res) => {
  const { email } = req.body;

  if (!email || !emailPattern.test(String(email).trim())) {
    return res.status(400).json({ message: "Please provide a valid email address." });
  }

  const isProduction = process.env.NODE_ENV === "production";

  // In production, always return the same message to prevent user enumeration.
  const safeMessage = "If an account exists with that email, a reset link has been sent.";

  const user = getUserAccountByEmail(String(email).trim().toLowerCase());
  if (!user) {
    if (isProduction) {
      return res.json({ message: safeMessage });
    }
    return res.status(404).json({ message: "No account found for that email address." });
  }

  const resetToken = crypto.randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 30).toISOString();

  db.prepare(
    `
      UPDATE users
      SET password_reset_token = ?, password_reset_expires_at = ?
      WHERE id = ?
    `
  ).run(hashResetToken(resetToken), expiresAt, user.id);

  // In production the token must be delivered via email, NEVER in the HTTP
  // response. In demo mode we return it for developer convenience.
  if (isProduction) {
    // TODO: integrate email service (SendGrid / SES / SMTP) to deliver the link.
    return res.json({ message: safeMessage });
  }

  const appOrigin = `${req.protocol}://${req.get("host")}`;
  const resetLink = `${appOrigin}/reset-password.html?token=${resetToken}`;

  return res.json({
    message: "Reset link generated (demo mode)",
    resetLink
  });
});

router.post("/reset-password", passwordResetLimiter, (req, res) => {
  const { token, password, confirmPassword } = req.body;

  if (!token || !password || !confirmPassword) {
    return res.status(400).json({ message: "Token, password, and confirmation are required." });
  }

  const passwordCheck = validatePassword(password);
  if (!passwordCheck.valid) {
    return res.status(400).json({ message: passwordCheck.message });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Password confirmation does not match." });
  }

  const user = db
    .prepare(
      `
        SELECT id, password_reset_expires_at
        FROM users
        WHERE password_reset_token = ?
      `
    )
    .get(hashResetToken(token));

  if (!user) {
    return res.status(400).json({ message: "The reset token is invalid." });
  }

  if (!user.password_reset_expires_at || new Date(user.password_reset_expires_at) < new Date()) {
    return res.status(400).json({ message: "The reset token has expired." });
  }

  const passwordHash = bcrypt.hashSync(password, 10);

  db.prepare(
    `
      UPDATE users
      SET password_hash = ?, password_reset_token = NULL, password_reset_expires_at = NULL
      WHERE id = ?
    `
  ).run(passwordHash, user.id);

  return res.json({ message: "Password reset successfully." });
});

router.get("/me", authMiddleware, (req, res) => {
  return res.json({ user: buildAuthPayload(req.user) });
});

module.exports = router;
