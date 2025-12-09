import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://zktxrirkdgksekvxlffb.supabase.co';
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InprdHhyaXJrZGdrc2VrdnhsZmZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTMwMjE0OSwiZXhwIjoyMDgwODc4MTQ5fQ.R95ofw4bwvYGVmcNniVaaqRO0Z_V6UaZEKehHVtyUUo';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
    auth: { persistSession: false },
});

// Users
export async function getUserByAadharHash(aadharHash) {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('aadhar_hash', aadharHash)
        .limit(1)
        .maybeSingle();

    if (error) throw error;
    return data;
}

export async function getUserByRawAadhaar(aadhar) {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('raw_aadhaar', aadhar)
        .limit(1)
        .maybeSingle();

    if (error) throw error;
    return data;
}

export async function createUser(user) {
    const { data, error } = await supabase.from('users').insert([user]).select().single();
    if (error) throw error;
    return data;
}

export async function markUserVoted(aadharHash) {
    const { data, error } = await supabase
        .from('users')
        .update({ has_voted: true, voted_at: new Date().toISOString() })
        .eq('aadhar_hash', aadharHash)
        .select();
    if (error) throw error;
    return data;
}

// Booths
export async function getBooths() {
    const { data, error } = await supabase.from('booths').select('*');
    if (error) throw error;
    return data;
}

// Logs
export async function addLog(entry) {
    const { data, error } = await supabase.from('logs').insert([entry]).select().single();
    if (error) throw error;
    return data;
}

export async function getLogs(filters = {}) {
    let query = supabase.from('logs').select('*');
    // Basic filters: booth_id, action
    if (filters.boothId) query = query.eq('booth_id', filters.boothId);
    if (filters.action) query = query.eq('action', filters.action);
    const { data, error } = await query;
    if (error) throw error;
    return data;
}

export default supabase;
