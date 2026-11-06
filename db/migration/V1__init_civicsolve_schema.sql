-- ============================================================
-- CivicSolve — V1 Initial Schema Migration
-- ============================================================
-- Flyway migration: V1__init_civicsolve_schema.sql
-- Database: PostgreSQL 16 + PostGIS 3.4
-- SRID: 4326 (WGS 84)
-- Source: dbrequirement.md §4
-- ============================================================

-- 1. Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Institutions Table
CREATE TABLE institutions (
    institution_id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'UNIVERSITY', 'COLLEGE', 'INDUSTRY', 'RESEARCH_LAB'
    district VARCHAR(100) NOT NULL,
    location GEOMETRY(Point, 4326) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_institutions_location ON institutions USING GIST (location);
CREATE INDEX idx_institutions_district ON institutions (district);

-- 3. Capabilities Table
CREATE TABLE capabilities (
    capability_id BIGSERIAL PRIMARY KEY,
    institution_id BIGINT NOT NULL REFERENCES institutions(institution_id) ON DELETE CASCADE,
    domain VARCHAR(100) NOT NULL,
    expertise VARCHAR(255) NOT NULL,
    capacity INT DEFAULT 5 CHECK (capacity >= 0)
);
CREATE INDEX idx_capabilities_domain ON capabilities (domain);

-- 4. Users Table
CREATE TABLE users (
    user_id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('CITIZEN', 'UNIVERSITY', 'INDUSTRY', 'GOVT', 'MODERATOR', 'ADMIN')),
    institution_id BIGINT REFERENCES institutions(institution_id) ON DELETE SET NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_users_role ON users (role);

-- 5. Challenges Table
CREATE TABLE challenges (
    challenge_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    domain VARCHAR(100),
    sub_domain VARCHAR(100),
    priority_score FLOAT CHECK (priority_score >= 0.0 AND priority_score <= 100.0),
    priority_explanation TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'SUBMITTED'
        CHECK (status IN ('SUBMITTED', 'AI_ANALYZED', 'VALIDATED', 'MATCHED', 'IN_PROJECT', 'RESOLVED', 'REJECTED', 'MERGED')),
    location GEOMETRY(Point, 4326) NOT NULL,
    district VARCHAR(100) NOT NULL,
    village_or_ward VARCHAR(150),
    reported_population INT DEFAULT 0,
    duplicate_of_id BIGINT REFERENCES challenges(challenge_id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_challenges_location ON challenges USING GIST (location);
CREATE INDEX idx_challenges_status ON challenges (status);
CREATE INDEX idx_challenges_domain ON challenges (domain);
CREATE INDEX idx_challenges_district ON challenges (district);
CREATE INDEX idx_challenges_priority ON challenges (priority_score DESC);

-- 6. Challenge Evidence Table
CREATE TABLE challenge_evidence (
    evidence_id BIGSERIAL PRIMARY KEY,
    challenge_id BIGINT NOT NULL REFERENCES challenges(challenge_id) ON DELETE CASCADE,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(50) NOT NULL CHECK (file_type IN ('IMAGE', 'VIDEO', 'DOCUMENT')),
    caption VARCHAR(255),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_evidence_challenge ON challenge_evidence (challenge_id);

-- 7. Moderator Audits Table
CREATE TABLE moderator_audits (
    audit_id BIGSERIAL PRIMARY KEY,
    challenge_id BIGINT NOT NULL REFERENCES challenges(challenge_id) ON DELETE CASCADE,
    moderator_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
    action VARCHAR(50) NOT NULL CHECK (action IN ('VALIDATE', 'REJECT', 'MERGE', 'OVERRIDE_PRIORITY')),
    reason TEXT NOT NULL,
    audited_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_audits_challenge ON moderator_audits (challenge_id);

-- 8. Projects Table
CREATE TABLE projects (
    project_id BIGSERIAL PRIMARY KEY,
    challenge_id BIGINT UNIQUE NOT NULL REFERENCES challenges(challenge_id) ON DELETE RESTRICT,
    institution_id BIGINT NOT NULL REFERENCES institutions(institution_id) ON DELETE RESTRICT,
    stage VARCHAR(50) NOT NULL DEFAULT 'PROPOSAL'
        CHECK (stage IN ('PROPOSAL', 'PROTOTYPE', 'FIELD_TEST', 'PILOT', 'DEPLOYED', 'COMPLETED')),
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_projects_stage ON projects (stage);

-- 9. Project Members Table
CREATE TABLE project_members (
    member_id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
    role_in_project VARCHAR(50) NOT NULL CHECK (role_in_project IN ('FACULTY_LEAD', 'STUDENT_RESEARCHER', 'INDUSTRY_MENTOR')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (project_id, user_id)
);

-- 10. Milestones Table
CREATE TABLE milestones (
    milestone_id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    due_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SUBMITTED', 'APPROVED', 'REJECTED')),
    deliverable_url VARCHAR(500),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_milestones_project ON milestones (project_id);

-- 11. Impact Metrics Table
CREATE TABLE impact_metrics (
    metric_id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
    metric_name VARCHAR(150) NOT NULL,
    before_value FLOAT NOT NULL,
    after_value FLOAT NOT NULL,
    unit VARCHAR(50) NOT NULL,
    verified_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_impact_project ON impact_metrics (project_id);
