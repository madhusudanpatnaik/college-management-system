"use strict";

/**
 * Centralized environment configuration.
 *
 * Secrets deliberately have NO fallback value. A hardcoded JWT signing secret
 * is not a convenience — anyone who knows it can mint a valid token for any
 * user and any role, including admin. Failing at startup is cheaper than
 * shipping a well-known key.
 *
 * Values are read from the real process environment; there is no dotenv
 * dependency. Export them in your shell, your service unit, or your process
 * manager. See .env.example for the full list.
 */

/**
 * Read a required environment variable, or throw.
 *
 * @param {string} key
 * @returns {string}
 */
function required(key) {
  const value = process.env[key];

  if (value === undefined || value === "") {
    throw new Error(
      `Missing required environment variable: ${key}. ` +
        `See .env.example and export it before starting the server.`
    );
  }

  return value;
}

/**
 * Read an optional environment variable, falling back to a non-sensitive default.
 *
 * @param {string} key
 * @param {string} fallback
 * @returns {string}
 */
function optional(key, fallback) {
  const value = process.env[key];

  return value === undefined || value === "" ? fallback : value;
}

module.exports = {
  JWT_SECRET: required("JWT_SECRET"),
  JWT_EXPIRES_IN: optional("JWT_EXPIRES_IN", "8h"),
  PORT: Number(optional("PORT", "3000")),
};
