// Centralized authentication configuration.
//
// The JWT signing secret was previously hardcoded with an insecure fallback in
// two places. It now lives here so there is a single source of truth and a
// fail-closed guard: in production we refuse to start with the default secret
// rather than silently signing forgeable tokens.

const FALLBACK_SECRET = "college-management-secret";

let JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "JWT_SECRET must be set in production. Refusing to start with the insecure default secret."
    );
  }

  JWT_SECRET = FALLBACK_SECRET;
  console.warn(
    "[security] JWT_SECRET is not set — using an insecure development default. Set JWT_SECRET before deploying."
  );
}

module.exports = {
  JWT_SECRET,
  JWT_EXPIRES_IN: "8h"
};
