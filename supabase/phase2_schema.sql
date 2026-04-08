-- ═══════════════════════════════════════════════════════════════
-- VoteRakshak Phase 2 — Supabase SQL Schema
-- Run in Supabase SQL Editor (new Phase 2 project)
-- https://zmibqvlgzrrwkcyxhabw.supabase.co
-- ═══════════════════════════════════════════════════════════════

-- Drop existing types if re-running (safe to run multiple times)
DROP TABLE IF EXISTS elected_positions CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS votes CASCADE;
DROP TABLE IF EXISTS candidates CASCADE;
DROP TABLE IF EXISTS elections CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS blos CASCADE;
DROP TABLE IF EXISTS booths CASCADE;

DROP TYPE IF EXISTS election_type CASCADE;
DROP TYPE IF EXISTS election_status CASCADE;
DROP TYPE IF EXISTS dept_code CASCADE;
DROP TYPE IF EXISTS year_enum CASCADE;

-- ─── ENUM TYPES ──────────────────────────────────────────────
CREATE TYPE election_type AS ENUM ('ER', 'DR', 'CR');
CREATE TYPE election_status AS ENUM ('pending', 'active', 'ended');
CREATE TYPE dept_code AS ENUM ('CO', 'AI', 'DS', 'ECS', 'ME', 'CE', 'EE');
CREATE TYPE year_enum AS ENUM ('1', '2', '3', '4');

-- ─── TABLE: booths ───────────────────────────────────────────
CREATE TABLE booths (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    department  dept_code NOT NULL UNIQUE,
    address     TEXT NOT NULL,
    is_active   BOOLEAN DEFAULT FALSE,
    current_state TEXT DEFAULT 'idle',
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- SEED: 7 predefined booths
INSERT INTO booths (id, name, department, address) VALUES
    ('BOOTH_001', 'CO Booth',     'CO',  'CO Department Admin Office, Ground Floor, Block A'),
    ('BOOTH_002', 'AI/ML Booth',  'AI',  'AI/ML Department Admin Office, Ground Floor, Block B'),
    ('BOOTH_003', 'DS Booth',     'DS',  'DS Department Admin Office, First Floor, Block A'),
    ('BOOTH_004', 'ECS Booth',    'ECS', 'ECS Department Admin Office, First Floor, Block B'),
    ('BOOTH_005', 'ME Booth',     'ME',  'ME Department Admin Office, Second Floor, Block C'),
    ('BOOTH_006', 'CE Booth',     'CE',  'CE Department Admin Office, Second Floor, Block D'),
    ('BOOTH_007', 'EE Booth',     'EE',  'EE Department Admin Office, Third Floor, Block C');

-- ─── TABLE: blos ─────────────────────────────────────────────
CREATE TABLE blos (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username      TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    display_name  TEXT NOT NULL,
    booth_id      TEXT REFERENCES booths(id),
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- SEED: 7 BLO accounts
-- NOTE: Replace <BCRYPT_HASH> with actual bcrypt hash of 'vote@123'
-- Generate using: node -e "const b=require('bcryptjs');console.log(b.hashSync('vote@123',10))"
-- Run server/seed_phase2.js to auto-insert with correct hashes
INSERT INTO blos (username, password_hash, display_name, booth_id) VALUES
    ('blo1@vote.rakshak', '$2a$10$PLACEHOLDER_HASH_BLO1', 'BLO 1 - CO',    'BOOTH_001'),
    ('blo2@vote.rakshak', '$2a$10$PLACEHOLDER_HASH_BLO2', 'BLO 2 - AI/ML', 'BOOTH_002'),
    ('blo3@vote.rakshak', '$2a$10$PLACEHOLDER_HASH_BLO3', 'BLO 3 - DS',    'BOOTH_003'),
    ('blo4@vote.rakshak', '$2a$10$PLACEHOLDER_HASH_BLO4', 'BLO 4 - ECS',   'BOOTH_004'),
    ('blo5@vote.rakshak', '$2a$10$PLACEHOLDER_HASH_BLO5', 'BLO 5 - ME',    'BOOTH_005'),
    ('blo6@vote.rakshak', '$2a$10$PLACEHOLDER_HASH_BLO6', 'BLO 6 - CE',    'BOOTH_006'),
    ('blo7@vote.rakshak', '$2a$10$PLACEHOLDER_HASH_BLO7', 'BLO 7 - EE',    'BOOTH_007');

-- ─── TABLE: students ─────────────────────────────────────────
CREATE TABLE students (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name      TEXT NOT NULL,
    middle_name     TEXT,
    last_name       TEXT NOT NULL,
    roll_number     TEXT NOT NULL UNIQUE,
    phone           TEXT NOT NULL,
    department      dept_code NOT NULL,
    year            year_enum NOT NULL,
    image_url       TEXT,
    fingerprint_id  TEXT,
    voter_hash      TEXT UNIQUE,   -- keccak256(roll_number + salt)
    booth_id        TEXT REFERENCES booths(id),
    is_registered   BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── TABLE: elections ────────────────────────────────────────
CREATE TABLE elections (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    election_type         election_type NOT NULL,
    department            dept_code,          -- NULL for ER
    year                  year_enum,          -- NULL for ER and DR
    status                election_status NOT NULL DEFAULT 'pending',
    started_at            TIMESTAMPTZ,
    ends_at               TIMESTAMPTZ NOT NULL,
    ended_at              TIMESTAMPTZ,
    winner_id             UUID REFERENCES students(id),
    blockchain_election_id TEXT,              -- keccak256 of election UUID
    created_by            TEXT NOT NULL,
    created_at            TIMESTAMPTZ DEFAULT NOW()
);

-- CONSTRAINT: Only one active election at a time
CREATE UNIQUE INDEX one_active_election ON elections (status) WHERE status = 'active';

-- ─── TABLE: candidates ───────────────────────────────────────
CREATE TABLE candidates (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    election_id  UUID NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
    student_id   UUID NOT NULL REFERENCES students(id),
    serial_no    INT NOT NULL CHECK (serial_no BETWEEN 1 AND 10),
    vote_count   INT DEFAULT 0,
    created_at   TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (election_id, student_id),
    UNIQUE (election_id, serial_no)
);

-- ─── TABLE: votes ────────────────────────────────────────────
CREATE TABLE votes (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    election_id  UUID NOT NULL REFERENCES elections(id),
    student_id   UUID NOT NULL REFERENCES students(id),
    candidate_id UUID NOT NULL REFERENCES candidates(id),
    tx_hash      TEXT NOT NULL,
    block_number BIGINT,
    voted_at     TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (election_id, student_id)   -- one vote per student per election
);

-- ─── TABLE: notifications ────────────────────────────────────
CREATE TABLE notifications (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id   UUID NOT NULL REFERENCES students(id),
    election_id  UUID NOT NULL REFERENCES elections(id),
    title        TEXT NOT NULL,
    message      TEXT NOT NULL,
    is_read      BOOLEAN DEFAULT FALSE,
    created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─── TABLE: audit_logs ───────────────────────────────────────
CREATE TABLE audit_logs (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type   TEXT NOT NULL,
    blo_id       UUID REFERENCES blos(id),
    booth_id     TEXT REFERENCES booths(id),
    student_id   UUID REFERENCES students(id),
    election_id  UUID REFERENCES elections(id),
    details      JSONB,
    created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─── TABLE: elected_positions ────────────────────────────────
-- Stores CURRENT position holders only (not permanent).
-- A student with a row here cannot be nominated.
-- Rows can be removed when a position ends / new election is declared.
CREATE TABLE elected_positions (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id   UUID NOT NULL REFERENCES students(id) UNIQUE,
    position     election_type NOT NULL,
    department   dept_code,         -- NULL for ER; set for DR/CR
    year         year_enum,         -- NULL for ER/DR; set for CR
    election_id  UUID NOT NULL REFERENCES elections(id),
    elected_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─── INDEXES ─────────────────────────────────────────────────
CREATE INDEX idx_students_dept        ON students(department);
CREATE INDEX idx_students_roll        ON students(roll_number);
CREATE INDEX idx_students_booth       ON students(booth_id);
CREATE INDEX idx_elections_status     ON elections(status);
CREATE INDEX idx_candidates_election  ON candidates(election_id);
CREATE INDEX idx_votes_election       ON votes(election_id);
CREATE INDEX idx_notifications_student ON notifications(student_id, is_read);
CREATE INDEX idx_audit_logs_booth     ON audit_logs(booth_id);
CREATE INDEX idx_audit_logs_created   ON audit_logs(created_at DESC);

-- ─── END OF SCHEMA ───────────────────────────────────────────
-- Next: Run server/seed_phase2.js to insert BLO bcrypt hashes.
-- Then start the server: cd server && npm run dev
