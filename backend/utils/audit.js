// Append-only audit trail for privileged and financial mutations (account
// create/delete, fee changes). Records who did what, to which entity, from which
// IP. The table intentionally has NO foreign key to users: an audit row must
// survive deletion of the actor or the target — otherwise deleting a student
// would erase the record of that very deletion.
//
// Recording is strictly best-effort: a failure here must never break the
// underlying operation, so every write is wrapped and swallowed.

const { db } = require("../config/db");

function recordAudit(req, { action, entity = null, entityId = null, summary = null }) {
  try {
    const actor = (req && req.user) || {};
    db.prepare(
      `
        INSERT INTO audit_log
          (actor_id, actor_role, actor_email, action, entity, entity_id, summary, ip_address)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `
    ).run(
      actor.id || null,
      actor.role || null,
      actor.email || null,
      action,
      entity,
      entityId == null ? null : Number(entityId),
      summary,
      (req && req.ip) || null
    );
  } catch (_error) {
    // Audit logging is non-critical; never surface its failures to the caller.
  }
}

module.exports = { recordAudit };
