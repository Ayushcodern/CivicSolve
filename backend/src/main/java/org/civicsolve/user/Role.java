package org.civicsolve.user;

/**
 * CivicSolve — User Role Definitions
 * Matches db/migration/V1__init_civicsolve_schema.sql CHECK constraint
 */
public enum Role {
    CITIZEN,
    UNIVERSITY,
    INDUSTRY,
    GOVT,
    MODERATOR,
    ADMIN
}
