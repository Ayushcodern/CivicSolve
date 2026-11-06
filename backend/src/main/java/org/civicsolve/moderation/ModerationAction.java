package org.civicsolve.moderation;

/**
 * CivicSolve — Moderator Audit Actions
 * Matches db/migration/V1__init_civicsolve_schema.sql CHECK constraint
 */
public enum ModerationAction {
    VALIDATE,
    REJECT,
    MERGE,
    OVERRIDE_PRIORITY
}
