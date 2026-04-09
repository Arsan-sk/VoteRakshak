import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://zmibqvlgzrrwkcyxhabw.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false },
});

// ─── STUDENTS ────────────────────────────────────────────────

export async function getStudentByRollNumber(rollNumber) {
    const { data, error } = await supabase
        .from('students')
        .select('*, booths(id, name, department, address)')
        .eq('roll_number', rollNumber.toUpperCase())
        .maybeSingle();
    if (error) throw error;
    return data;
}

export async function getStudentByVoterHash(voterHash) {
    const { data, error } = await supabase
        .from('students')
        .select('*, booths(id, name, department, address)')
        .eq('voter_hash', voterHash)
        .maybeSingle();
    if (error) throw error;
    return data;
}

export async function getStudentById(id) {
    const { data, error } = await supabase
        .from('students')
        .select('*, booths(id, name, department, address)')
        .eq('id', id)
        .maybeSingle();
    if (error) throw error;
    return data;
}

export async function createStudent(student) {
    const { data, error } = await supabase
        .from('students')
        .insert([student])
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function getAllStudents({ dept, year, search, limit = 50, offset = 0 } = {}) {
    let query = supabase
        .from('students')
        .select('*, booths(id, name, department, address)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (dept) query = query.eq('department', dept);
    if (year) query = query.eq('year', year);
    if (search) query = query.ilike('roll_number', `%${search}%`);

    const { data, error, count } = await query;
    if (error) throw error;
    return { students: data, total: count };
}

// ─── BLOS ────────────────────────────────────────────────────

export async function getBLOByUsername(username) {
    const { data, error } = await supabase
        .from('blos')
        .select('*, booths(id, name, department, address)')
        .eq('username', username)
        .maybeSingle();
    if (error) throw error;
    return data;
}

export async function getBLOById(id) {
    const { data, error } = await supabase
        .from('blos')
        .select('*, booths(id, name, department, address)')
        .eq('id', id)
        .maybeSingle();
    if (error) throw error;
    return data;
}

export async function getAllBLOs() {
    const { data, error } = await supabase
        .from('blos')
        .select('*, booths(id, name, department, address)')
        .order('display_name');
    if (error) throw error;
    return data;
}

export async function reassignBLO(bloId, newBoothId) {
    const { data, error } = await supabase
        .from('blos')
        .update({ booth_id: newBoothId })
        .eq('id', bloId)
        .select()
        .single();
    if (error) throw error;
    return data;
}

// ─── BOOTHS ──────────────────────────────────────────────────

export async function getBooths() {
    const { data, error } = await supabase.from('booths').select('*').order('id');
    if (error) throw error;
    return data;
}

export async function getBoothByDept(department) {
    const { data, error } = await supabase
        .from('booths')
        .select('*')
        .eq('department', department)
        .maybeSingle();
    if (error) throw error;
    return data;
}

export async function updateBoothState(boothId, state) {
    const { data, error } = await supabase
        .from('booths')
        .update({ current_state: state, is_active: state !== 'idle' })
        .eq('id', boothId)
        .select()
        .single();
    if (error) throw error;
    return data;
}

// ─── ELECTIONS ───────────────────────────────────────────────

export async function createElection(election) {
    const { data, error } = await supabase
        .from('elections')
        .insert([election])
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function getActiveElection() {
    const { data, error } = await supabase
        .from('elections')
        .select('*')
        .eq('status', 'active')
        .maybeSingle();
    if (error) throw error;
    return data;
}

export async function getElectionById(id) {
    const { data, error } = await supabase
        .from('elections')
        .select('*')
        .eq('id', id)
        .maybeSingle();
    if (error) throw error;
    return data;
}

export async function getAllElections() {
    const { data, error } = await supabase
        .from('elections')
        .select('*, students!winner_id(first_name, last_name, department, roll_number)')
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
}

export async function updateElectionStatus(id, status, extraFields = {}) {
    const { data, error } = await supabase
        .from('elections')
        .update({ status, ...extraFields })
        .eq('id', id)
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function setElectionWinner(electionId, winnerId) {
    const { data, error } = await supabase
        .from('elections')
        .update({
            winner_id: winnerId,
            status: 'ended',
            ended_at: new Date().toISOString(),
        })
        .eq('id', electionId)
        .select()
        .single();
    if (error) throw error;
    return data;
}

// ─── CANDIDATES ──────────────────────────────────────────────

export async function addCandidate(candidate) {
    const { data, error } = await supabase
        .from('candidates')
        .insert([candidate])
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function getCandidatesByElection(electionId) {
    const { data, error } = await supabase
        .from('candidates')
        .select('*, students(id, first_name, middle_name, last_name, roll_number, department, year, image_url)')
        .eq('election_id', electionId)
        .order('serial_no');
    if (error) throw error;
    return data;
}

export async function incrementCandidateVoteCount(candidateId) {
    const { data, error } = await supabase.rpc('increment_vote_count', {
        candidate_id: candidateId,
    });
    if (error) {
        // Fallback: manual increment
        const { data: curr } = await supabase
            .from('candidates')
            .select('vote_count')
            .eq('id', candidateId)
            .single();
        await supabase
            .from('candidates')
            .update({ vote_count: (curr?.vote_count || 0) + 1 })
            .eq('id', candidateId);
    }
    return data;
}

export async function getCandidateById(id) {
    const { data, error } = await supabase
        .from('candidates')
        .select('*, students(*)')
        .eq('id', id)
        .maybeSingle();
    if (error) throw error;
    return data;
}

// ─── VOTES ───────────────────────────────────────────────────

export async function recordVote(vote) {
    const { data, error } = await supabase
        .from('votes')
        .insert([vote])
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function hasStudentVoted(electionId, studentId) {
    const { data, error } = await supabase
        .from('votes')
        .select('id')
        .eq('election_id', electionId)
        .eq('student_id', studentId)
        .maybeSingle();
    if (error) throw error;
    return !!data;
}

export async function getVotesByElection(electionId) {
    const { data, error } = await supabase
        .from('votes')
        .select('*')
        .eq('election_id', electionId);
    if (error) throw error;
    return data;
}

// ─── NOTIFICATIONS ───────────────────────────────────────────

export async function createNotifications(notifications) {
    const { data, error } = await supabase
        .from('notifications')
        .insert(notifications)
        .select();
    if (error) throw error;
    return data;
}

export async function getStudentNotifications(studentId, { unreadOnly = false } = {}) {
    let query = supabase
        .from('notifications')
        .select('*, elections(election_type, status, ends_at)')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

    if (unreadOnly) query = query.eq('is_read', false);

    const { data, error } = await query;
    if (error) throw error;
    return data;
}

export async function markNotificationRead(notificationId) {
    const { data, error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function getUnreadNotificationCount(studentId) {
    const { count, error } = await supabase
        .from('notifications')
        .select('id', { count: 'exact' })
        .eq('student_id', studentId)
        .eq('is_read', false);
    if (error) throw error;
    return count || 0;
}

// ─── AUDIT LOGS ──────────────────────────────────────────────

export async function addAuditLog(entry) {
    const { data, error } = await supabase
        .from('audit_logs')
        .insert([entry])
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function getAuditLogs({ boothId, bloId, limit = 100 } = {}) {
    let query = supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

    if (boothId) query = query.eq('booth_id', boothId);
    if (bloId) query = query.eq('blo_id', bloId);

    const { data, error } = await query;
    if (error) throw error;
    return data;
}

// Phase 1 compat
export async function addLog(entry) {
    return addAuditLog({
        event_type: entry.action || 'LOG',
        booth_id: entry.booth_id || null,
        details: entry,
    });
}
export async function getLogs(filters = {}) {
    return getAuditLogs(filters);
}

// ─── ELECTED POSITIONS ───────────────────────────────────────

export async function recordElectedPosition(position) {
    // Upsert: one student can only hold one position at a time
    const { data, error } = await supabase
        .from('elected_positions')
        .upsert([position], { onConflict: 'student_id' })
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function isStudentCurrentlyElected(studentId) {
    const { data, error } = await supabase
        .from('elected_positions')
        .select('id, position')
        .eq('student_id', studentId)
        .maybeSingle();
    if (error) throw error;
    return !!data;
}

export async function getElectedPositions() {
    const { data, error } = await supabase
        .from('elected_positions')
        .select('*, students(first_name, last_name, roll_number, department, year, image_url), elections(election_type)');
    if (error) throw error;
    return data;
}

export async function clearElectedPosition(studentId) {
    const { error } = await supabase
        .from('elected_positions')
        .delete()
        .eq('student_id', studentId);
    if (error) throw error;
}

export async function getElectedPositionsHistory() {
    const { data, error } = await supabase
        .from('elected_positions')
        .select('*, students(first_name, last_name, roll_number, department, year, image_url), elections(election_type, department, year, status, ended_at)')
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
}

// ─── DASHBOARD STATS ─────────────────────────────────────────

export async function getDashboardStats() {
    const [studentsRes, electionsRes, boothsRes] = await Promise.all([
        supabase.from('students').select('id', { count: 'exact' }),
        supabase.from('elections').select('id, status'),
        supabase.from('booths').select('id, is_active'),
    ]);
    return {
        totalStudents: studentsRes.count || 0,
        activeElection: (electionsRes.data || []).find(e => e.status === 'active') || null,
        totalElections: (electionsRes.data || []).length,
        onlineBooths: (boothsRes.data || []).filter(b => b.is_active).length,
    };
}

export default supabase;
