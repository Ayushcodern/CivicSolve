-- ============================================================
-- CivicSolve — V2 Seed Data
-- ============================================================
-- Flyway migration: V2__seed_civicsolve_data.sql
-- Populates authentic test data for Madhya Pradesh
-- Source: dbrequirement.md §5 + dummy frontend mock data
-- ============================================================

-- ── 1. Institutions (exact GPS coordinates) ─────────────────

INSERT INTO institutions (institution_id, name, type, district, location) VALUES
(1, 'Acropolis Institute of Technology & Research (AITR)',           'UNIVERSITY',    'Indore',  ST_SetSRID(ST_Point(75.8956, 22.8214), 4326)),
(2, 'Shri Govindram Seksaria Institute of Technology and Science (SGSITS)', 'UNIVERSITY', 'Indore', ST_SetSRID(ST_Point(75.8754, 22.7244), 4326)),
(3, 'Indian Institute of Technology Indore (IIT Indore)',           'RESEARCH_LAB',  'Indore',  ST_SetSRID(ST_Point(75.9207, 22.5204), 4326)),
(4, 'AquaFilter Pvt. Ltd.',                                        'INDUSTRY',      'Indore',  ST_SetSRID(ST_Point(75.8577, 22.7196), 4326));

-- Reset sequence to avoid PK collision on next insert
SELECT setval('institutions_institution_id_seq', (SELECT MAX(institution_id) FROM institutions));

-- ── 2. Capabilities ─────────────────────────────────────────

INSERT INTO capabilities (institution_id, domain, expertise, capacity) VALUES
-- AITR
(1, 'Water Supply',         'IoT telemetry, groundwater turbidity monitoring',          4),
(1, 'Rural Infrastructure', 'Low-cost road stability analysis',                         3),
(1, 'Public Health',        'Embedded systems for cold-chain monitoring',               2),
-- SGSITS
(2, 'Water Supply',         'Environmental engineering, chemical water filtration',      5),
(2, 'Sanitation',           'Municipal solid waste management',                          4),
(2, 'Agriculture',          'Soil quality analysis, precision agriculture sensors',      3),
-- IIT Indore
(3, 'Agriculture',          'Machine learning for pest prediction, satellite imagery',   6),
(3, 'Public Health',        'Biomedical device prototyping, solar cold-chain R&D',       4),
-- AquaFilter Pvt. Ltd.
(4, 'Water Supply',         'Commercial gravity-fed ceramic membrane filtration',        10);

-- ── 3. Users (BCrypt hashes — password: "civicsolve123") ────

INSERT INTO users (user_id, name, email, password_hash, role, institution_id, phone) VALUES
(1, 'Ramesh Patel',              'citizen@civicsolve.in',          '$2a$12$e80yqRzK.9y4p2N0O14c2.Wj7E0eZ3pGzZ2X6L5nE9m4H1u9Q5R4a', 'CITIZEN',   NULL, '9876543210'),
(2, 'Prof. Aaquib Multani',      'faculty@aitr.ac.in',             '$2a$12$e80yqRzK.9y4p2N0O14c2.Wj7E0eZ3pGzZ2X6L5nE9m4H1u9Q5R4a', 'UNIVERSITY', 1,   '9826012345'),
(3, 'District Collector Officer', 'collector.indore@mp.gov.in',    '$2a$12$e80yqRzK.9y4p2N0O14c2.Wj7E0eZ3pGzZ2X6L5nE9m4H1u9Q5R4a', 'GOVT',      NULL, '07312444555'),
(4, 'State Review Moderator',    'moderator@civicsolve.in',        '$2a$12$e80yqRzK.9y4p2N0O14c2.Wj7E0eZ3pGzZ2X6L5nE9m4H1u9Q5R4a', 'MODERATOR', NULL, '9998887776');

SELECT setval('users_user_id_seq', (SELECT MAX(user_id) FROM users));

-- ── 4. Challenges (matching frontend mock IDs) ──────────────
-- IDs chosen to produce CS-{id} display codes matching the dummy frontend

INSERT INTO challenges (challenge_id, user_id, title, description, domain, sub_domain, priority_score, priority_explanation, status, location, district, village_or_ward, reported_population) VALUES

-- CS-2611: Handpump muddy water — Sanwer, Indore (from dbrequirement.md §5)
(2611, 1,
 'Handpump yields muddy water after monsoon',
 'Our village community handpump dispenses yellowish mud water after rainfall. School children have developed gastrointestinal illness. 14 residents have independently reported this issue.',
 'Water Supply', 'Groundwater Quality', 82.4,
 'Severity 0.90, Population 1200, Health hazard flag active near primary school',
 'VALIDATED',
 ST_SetSRID(ST_Point(75.8321, 22.9734), 4326),
 'Indore', 'Sanwer Ward 4', 1200),

-- CS-2598: Road washout — Badnawar, Dhar
(2598, 1,
 'Village approach road washes out every July',
 'The unpaved approach road connecting Badnawar village to the state highway becomes impassable during monsoon. Ambulances and supply trucks are cut off for weeks. 9 reports filed.',
 'Rural Infrastructure', 'Road Connectivity', 76.0,
 'Severity 0.78, Population 3400, Emergency access disruption flag',
 'MATCHED',
 ST_SetSRID(ST_Point(75.0625, 23.0258), 4326),
 'Dhar', 'Badnawar', 3400),

-- CS-2544: Waste segregation — Mhow, Indore
(2544, 1,
 'No segregation at weekly haat waste dump',
 'The weekly market (haat) in Mhow generates large amounts of unsegregated waste dumped in an open lot near the railway station. 22 residents have complained of stench and mosquito breeding.',
 'Sanitation', 'Solid Waste Management', 64.0,
 'Severity 0.65, Population 2800, Repeated complaints from 22 reporters',
 'IN_PROJECT',
 ST_SetSRID(ST_Point(75.7618, 22.5572), 4326),
 'Indore', 'Mhow', 2800),

-- CS-2490: Soybean pest losses — Sehore
(2490, 1,
 'Soybean crop losses from unpredicted pest spread',
 'Soybean farmers in Sehore district face recurring crop losses due to pest infestations that arrive without early warning. 31 farmers have collectively reported the problem.',
 'Agriculture', 'Pest Management', 88.0,
 'Severity 0.92, Population 5200, Livelihood impact on 31 farming families',
 'MATCHED',
 ST_SetSRID(ST_Point(77.0854, 23.2005), 4326),
 'Sehore', 'Sehore Tehsil', 5200),

-- CS-2433: PHC cold storage — Barwani
(2433, 1,
 'PHC lacks cold storage for vaccines during outages',
 'The Primary Health Centre in Barwani loses power frequently during summer. Vaccines require 2–8°C storage and spoil within hours. 6 health workers have reported this critical gap.',
 'Public Health', 'Cold Chain Infrastructure', 91.0,
 'Severity 0.95, Population 8000, Critical health infrastructure failure',
 'RESOLVED',
 ST_SetSRID(ST_Point(74.9041, 22.0367), 4326),
 'Barwani', 'Barwani Town', 8000),

-- CS-2401: School tank leak — Dewas
(2401, 1,
 'Overhead tank leaking at government school',
 'The overhead water tank at the government primary school in Dewas has been leaking for 3 months. Children are without drinking water during school hours. 4 parents have reported it.',
 'Water Supply', 'Water Storage', 58.0,
 'Severity 0.55, Population 600, Children affected, low reporter count',
 'RESOLVED',
 ST_SetSRID(ST_Point(76.0507, 22.9624), 4326),
 'Dewas', 'Dewas Ward 12', 600);

SELECT setval('challenges_challenge_id_seq', (SELECT MAX(challenge_id) FROM challenges));

-- ── 5. Challenge Evidence ───────────────────────────────────

INSERT INTO challenge_evidence (challenge_id, file_path, file_type, caption) VALUES
(2611, '/uploads/evidence/2611_handpump_muddy.jpg',    'IMAGE',    'Turbid water collected in bucket at 10 AM'),
(2611, '/uploads/evidence/2611_school_report.pdf',     'DOCUMENT', 'Health officer report on gastrointestinal cases'),
(2598, '/uploads/evidence/2598_washed_road.jpg',       'IMAGE',    'Road completely submerged during July 2026 rains'),
(2544, '/uploads/evidence/2544_haat_waste.jpg',        'IMAGE',    'Unsegregated waste pile near railway station'),
(2490, '/uploads/evidence/2490_damaged_soybean.jpg',   'IMAGE',    'Soybean field showing pest damage'),
(2433, '/uploads/evidence/2433_broken_fridge.jpg',     'IMAGE',    'Non-functional vaccine refrigerator at PHC'),
(2401, '/uploads/evidence/2401_leaking_tank.jpg',      'IMAGE',    'Visible crack and water flow on school tank');

-- ── 6. Moderator Audits ─────────────────────────────────────

INSERT INTO moderator_audits (challenge_id, moderator_id, action, reason) VALUES
(2611, 4, 'VALIDATE',  'Field visit confirmed turbidity. Lab results show 85 NTU. Validated for project matching.'),
(2433, 4, 'VALIDATE',  'District health officer confirmed cold-chain failure. Prioritized for immediate action.'),
(2401, 4, 'VALIDATE',  'School inspection confirmed leaking overhead tank. Approved for repair project.');

-- ── 7. Projects ─────────────────────────────────────────────

INSERT INTO projects (project_id, challenge_id, institution_id, stage, start_date, end_date) VALUES
(501, 2611, 1, 'PROTOTYPE',  '2026-10-01', NULL),        -- AITR tackling handpump turbidity
(502, 2544, 2, 'PILOT',      '2026-09-15', NULL),        -- SGSITS waste management pilot
(503, 2490, 3, 'FIELD_TEST', '2026-08-20', NULL),        -- IIT Indore pest prediction ML
(504, 2433, 3, 'COMPLETED',  '2026-06-01', '2026-09-30'),-- IIT Indore solar cold-chain (done)
(505, 2401, 1, 'COMPLETED',  '2026-07-10', '2026-08-15');-- AITR tank repair (done)

SELECT setval('projects_project_id_seq', (SELECT MAX(project_id) FROM projects));

-- ── 8. Project Members ──────────────────────────────────────

INSERT INTO project_members (project_id, user_id, role_in_project) VALUES
(501, 2, 'FACULTY_LEAD'),        -- Prof. Multani leads handpump project
(502, 2, 'FACULTY_LEAD'),        -- Prof. Multani advises waste project
(503, 2, 'INDUSTRY_MENTOR');      -- Prof. Multani mentors pest prediction

-- ── 9. Milestones ───────────────────────────────────────────

INSERT INTO milestones (project_id, title, description, due_date, status, deliverable_url) VALUES
-- Project 501 (Handpump)
(501, 'Water Sample Lab Analysis',          'Complete chemical, fluoride, and microbiological testing of water samples',   '2026-10-15', 'APPROVED',  '/deliverables/501/lab_report.pdf'),
(501, 'Sand-Gravel Pre-filter Prototype',   'Design low-cost casing pre-filter to fit village handpump outlet',            '2026-11-05', 'PENDING',   NULL),
-- Project 502 (Waste)
(502, 'Waste Audit Report',                 'Quantify weekly haat waste generation by category',                           '2026-10-01', 'APPROVED',  '/deliverables/502/waste_audit.pdf'),
(502, 'Segregation Bin Deployment',         'Install color-coded segregation bins at 5 collection points',                 '2026-10-20', 'SUBMITTED', NULL),
-- Project 503 (Pest prediction)
(503, 'Satellite Imagery Dataset',          'Acquire and preprocess 3-year NDVI time series for Sehore district',          '2026-09-10', 'APPROVED',  '/deliverables/503/ndvi_dataset.zip'),
(503, 'ML Model v1 Training',              'Train pest outbreak prediction model with ≥80% accuracy on validation set',   '2026-10-25', 'PENDING',   NULL),
-- Project 504 (Cold chain — completed)
(504, 'Solar Panel Installation',           'Install 2kW solar panel array at Barwani PHC',                                '2026-07-15', 'APPROVED',  '/deliverables/504/install_photos.zip'),
(504, 'Cold-Chain Monitoring IoT Setup',    'Deploy temperature sensors with GSM alerts for vaccine fridge',               '2026-08-30', 'APPROVED',  '/deliverables/504/iot_dashboard.pdf');

-- ── 10. Impact Metrics ──────────────────────────────────────

INSERT INTO impact_metrics (project_id, metric_name, before_value, after_value, unit) VALUES
-- Project 501 (in progress — partial metrics)
(501, 'Water Turbidity Level',     85.0,   4.2,    'NTU'),
(501, 'Beneficiaries Served',      0.0,    1200.0, 'Citizens'),
-- Project 502 (in progress)
(502, 'Waste Segregation Rate',    5.0,    62.0,   'Percent'),
-- Project 504 (completed)
(504, 'Vaccine Spoilage Events',   12.0,   0.0,    'Events/Quarter'),
(504, 'Cold-Chain Uptime',         40.0,   99.2,   'Percent'),
(504, 'Beneficiaries Served',      0.0,    8000.0, 'Citizens'),
-- Project 505 (completed)
(505, 'Tank Leak Volume',          200.0,  0.0,    'Liters/Day'),
(505, 'Students With Water Access', 0.0,   600.0,  'Students');
