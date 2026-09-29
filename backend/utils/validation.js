// Shared validation primitives reused across routes.

// Pragmatic email shape check (not RFC-complete, but rejects obvious garbage).
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(value) {
  return emailPattern.test(String(value || "").trim());
}

// Password policy: length floor plus character-class diversity. Enforced anywhere
// a password is set (admin-created accounts + self-service reset) so a single
// change here updates every entry point. Returns { valid, message } — callers
// surface `message` on failure.
const MIN_PASSWORD_LENGTH = 8;

function validatePassword(value) {
  const password = String(value || "");

  if (password.length < MIN_PASSWORD_LENGTH) {
    return { valid: false, message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.` };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: "Password must include at least one lowercase letter." };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: "Password must include at least one uppercase letter." };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: "Password must include at least one number." };
  }

  return { valid: true, message: null };
}

module.exports = { emailPattern, isValidEmail, validatePassword, MIN_PASSWORD_LENGTH };
