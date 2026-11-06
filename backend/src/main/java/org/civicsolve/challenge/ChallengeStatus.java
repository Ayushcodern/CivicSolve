package org.civicsolve.challenge;

/**
 * CivicSolve — Challenge Lifecycle Statuses
 * Matches db/migration/V1__init_civicsolve_schema.sql CHECK constraint
 */
public enum ChallengeStatus {
    SUBMITTED,
    AI_ANALYZED,
    VALIDATED,
    MATCHED,
    IN_PROJECT,
    RESOLVED,
    REJECTED,
    MERGED
}
