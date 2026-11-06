package org.civicsolve.project;

/**
 * CivicSolve — Project Lifecycle Stages
 * Matches db/migration/V1__init_civicsolve_schema.sql projects.stage CHECK constraint:
 * ('PROPOSAL', 'PROTOTYPE', 'FIELD_TEST', 'PILOT', 'DEPLOYED', 'COMPLETED')
 */
public enum ProjectStage {
    PROPOSAL,
    PROTOTYPE,
    FIELD_TEST,
    PILOT,
    DEPLOYED,
    COMPLETED;

    public ProjectStage nextStage() {
        return switch (this) {
            case PROPOSAL -> PROTOTYPE;
            case PROTOTYPE -> FIELD_TEST;
            case FIELD_TEST -> PILOT;
            case PILOT -> DEPLOYED;
            case DEPLOYED -> COMPLETED;
            case COMPLETED -> null;
        };
    }
}
