package org.civicsolve.project;

/**
 * CivicSolve — Milestone Statuses
 * Matches db/migration/V1__init_civicsolve_schema.sql milestones.status CHECK constraint:
 * ('PENDING', 'SUBMITTED', 'APPROVED', 'REJECTED')
 */
public enum MilestoneStatus {
    PENDING,
    SUBMITTED,
    APPROVED,
    REJECTED
}
