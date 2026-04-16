-- ═══════════════════════════════════════════════════════════════
-- VoteRakshak Phase 2 — System Flags Table
-- Run this in Supabase SQL Editor AFTER phase2_schema.sql
-- ═══════════════════════════════════════════════════════════════

-- 1. Create system_flags table
CREATE TABLE IF NOT EXISTS system_flags (
    key         TEXT PRIMARY KEY,
    value       BOOLEAN NOT NULL DEFAULT false,
    description TEXT,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Auto-update updated_at on every change
CREATE OR REPLACE FUNCTION update_system_flags_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS system_flags_updated_at ON system_flags;
CREATE TRIGGER system_flags_updated_at
    BEFORE UPDATE ON system_flags
    FOR EACH ROW EXECUTE FUNCTION update_system_flags_timestamp();

-- 3. Insert all flags with default values = false
-- Use INSERT ... ON CONFLICT DO NOTHING so re-runs are safe
INSERT INTO system_flags (key, value, description) VALUES
    (
        'biometric_mode',
        false,
        'true = fingerprint scanner for login & vote confirmation (production); false = 4-digit PIN (testing/dev)'
    ),
    (
        'fingerprint_required',
        false,
        'true = fingerprint template mandatory during voter registration; false = optional'
    ),
    (
        'election_notifications_enabled',
        false,
        'true = send WebSocket/DB notifications to voters when an election starts'
    ),
    (
        'allow_cross_dept_voting',
        false,
        'true = ER election allows any dept voter at any booth; false = strict dept enforcement'
    ),
    (
        'debug_mode',
        false,
        'true = verbose server-side logging; false = normal logging'
    ),
    (
        'maintenance_mode',
        false,
        'true = all booths show maintenance screen, no voting allowed'
    )
ON CONFLICT (key) DO NOTHING;

-- 4. Verify
SELECT key, value, description, updated_at FROM system_flags ORDER BY key;
