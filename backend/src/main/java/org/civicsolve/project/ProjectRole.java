package org.civicsolve.project;

/**
 * CivicSolve — Project Team Member Roles
 * Matches db/migration/V1__init_civicsolve_schema.sql project_members.role_in_project CHECK constraint:
 * ('FACULTY_LEAD', 'STUDENT_RESEARCHER', 'INDUSTRY_MENTOR')
 */
public enum ProjectRole {
    FACULTY_LEAD,
    STUDENT_RESEARCHER,
    INDUSTRY_MENTOR
}
