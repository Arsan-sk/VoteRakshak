/**
 * System Flags Manager — Phase 2
 * Reads flags from the `system_flags` Supabase table.
 * Caches values for 30s to avoid a DB hit on every request.
 * Falls back to `false` (safe default) if DB is unreachable.
 *
 * Usage:
 *   import { getFlag, getAllFlags, refreshFlags } from './flagsManager.js';
 *
 *   const biometricMode  = await getFlag('biometric_mode');       // boolean
 *   const allFlags       = await getAllFlags();                    // { key: boolean, ... }
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
    process.env.SUPABASE_URL || 'https://zmibqvlgzrrwkcyxhabw.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_ANON_KEY,
    { auth: { persistSession: false } }
);

// ── In-memory cache ──────────────────────────────────
const FLAG_CACHE_TTL_MS = 30_000;   // 30 second TTL

const _cache = {
    flags: {},          // { key: boolean }
    lastFetched: 0,     // epoch ms of last full fetch
};

// ── Internal: bulk fetch (refreshes cache) ──────────
async function _fetchAllFromDB() {
    const { data, error } = await supabase
        .from('system_flags')
        .select('key, value');

    if (error) {
        console.warn('⚠️ [FlagsManager] DB fetch failed:', error.message, '— using cached/default values');
        return;
    }

    if (!data || data.length === 0) {
        console.warn('⚠️ [FlagsManager] system_flags table is empty');
        return;
    }

    data.forEach(row => {
        _cache.flags[row.key] = Boolean(row.value);
    });
    _cache.lastFetched = Date.now();

    if (process.env.ENABLE_DEBUG === 'true') {
        console.log('🏴 [FlagsManager] Flags refreshed from DB:', _cache.flags);
    }
}

// ── Check if cache needs refresh ─────────────────────
function _isCacheStale() {
    return Date.now() - _cache.lastFetched > FLAG_CACHE_TTL_MS;
}

// ── Public API ────────────────────────────────────────

/**
 * Get a single flag by key.
 * Returns boolean (defaults to false if key not found).
 */
export async function getFlag(key) {
    if (_isCacheStale()) {
        await _fetchAllFromDB();
    }
    // Fall back to false — the "safe off" state for all flags
    return _cache.flags[key] ?? false;
}

/**
 * Get all flags as a plain object { key: boolean, ... }.
 */
export async function getAllFlags() {
    if (_isCacheStale()) {
        await _fetchAllFromDB();
    }
    return { ..._cache.flags };
}

/**
 * Force-refresh the flag cache immediately.
 * Call this after updating flags via admin panel.
 */
export async function refreshFlags() {
    await _fetchAllFromDB();
    return { ..._cache.flags };
}

/**
 * Pre-warm: fetch all flags at server startup.
 * Called once from server.js to avoid the first-request delay.
 */
export async function initFlags() {
    await _fetchAllFromDB();
    console.log('✅ [FlagsManager] System flags loaded:', _cache.flags);
}
