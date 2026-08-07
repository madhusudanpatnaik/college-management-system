// Shared validation primitives reused across routes.

// Pragmatic email shape check (not RFC-complete, but rejects obvious garbage).
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(value) {
  return emailPattern.test(String(value || "").trim());
}

module.exports = { emailPattern, isValidEmail };
