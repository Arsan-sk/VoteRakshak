-- Supabase / Postgres migration for VoteRakshak
-- Run these statements in Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- Users table
CREATE TABLE IF NOT EXISTS public.users (
  id text PRIMARY KEY,
  aadhar_hash text UNIQUE,
  raw_aadhaar text,
  name_first text,
  name_middle text,
  name_last text,
  age integer,
  phone text,
  photo text,
  biometric jsonb,
  has_voted boolean DEFAULT false,
  registered_at timestamptz,
  voted_at timestamptz
);

-- Booths table
CREATE TABLE IF NOT EXISTS public.booths (
  id text PRIMARY KEY,
  name text,
  address text,
  coordinates jsonb
);

-- Logs / audit
CREATE TABLE IF NOT EXISTS public.logs (
  id text PRIMARY KEY,
  action text,
  booth_id text,
  voter_aadhar text,
  officer_id text,
  status text,
  details jsonb,
  timestamp timestamptz DEFAULT now()
);

-- Sample booths insertion (optional)
INSERT INTO public.booths (id, name, address, coordinates)
VALUES
  ('BOOTH_001', 'Central Polling Station', '123 Main Street, Mumbai, Maharashtra', json_build_object('lat', 19.0760, 'lng', 72.8777)),
  ('BOOTH_002', 'North District Center', '456 Park Avenue, Mumbai, Maharashtra', json_build_object('lat', 19.1136, 'lng', 72.8697)),
  ('BOOTH_003', 'South Community Hall', '789 Beach Road, Mumbai, Maharashtra', json_build_object('lat', 18.9220, 'lng', 72.8347))
ON CONFLICT (id) DO NOTHING;
