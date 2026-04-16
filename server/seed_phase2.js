/**
 * Phase 2 BLO Seed Script
 * Generates bcrypt hashes for 'vote@123' and updates the blos table in Supabase
 * 
 * Run: node server/seed_phase2.js
 * (after running supabase/phase2_schema.sql in the Supabase SQL Editor)
 */

import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_ANON_KEY
);

const BLO_PASSWORD = 'vote@123';

const BLOS = [
    { username: 'blo1@vote.rakshak', display_name: 'BLO 1 - CO',    booth_id: 'BOOTH_001' },
    { username: 'blo2@vote.rakshak', display_name: 'BLO 2 - AI/ML', booth_id: 'BOOTH_002' },
    { username: 'blo3@vote.rakshak', display_name: 'BLO 3 - DS',    booth_id: 'BOOTH_003' },
    { username: 'blo4@vote.rakshak', display_name: 'BLO 4 - ECS',   booth_id: 'BOOTH_004' },
    { username: 'blo5@vote.rakshak', display_name: 'BLO 5 - ME',    booth_id: 'BOOTH_005' },
    { username: 'blo6@vote.rakshak', display_name: 'BLO 6 - CE',    booth_id: 'BOOTH_006' },
    { username: 'blo7@vote.rakshak', display_name: 'BLO 7 - EE',    booth_id: 'BOOTH_007' },
];

async function seedBLOs() {
    console.log('═══════════════════════════════════════════════════');
    console.log('🌱 VoteRakshak Phase 2 — BLO Seed Script');
    console.log('═══════════════════════════════════════════════════');

    console.log(`🔐 Generating bcrypt hash for '${BLO_PASSWORD}'...`);
    const passwordHash = await bcrypt.hash(BLO_PASSWORD, 10);
    console.log(`✅ Hash: ${passwordHash}`);

    console.log('\n📝 Inserting BLOs into Supabase...\n');

    for (const blo of BLOS) {
        const { data, error } = await supabase
            .from('blos')
            .upsert(
                [{ ...blo, password_hash: passwordHash }],
                { onConflict: 'username' }
            )
            .select();

        if (error) {
            console.error(`❌ Failed to seed ${blo.username}:`, error.message);
        } else {
            console.log(`✅ Seeded: ${blo.username} → ${blo.booth_id}`);
        }
    }

    // Verify
    const { data: blos, error } = await supabase
        .from('blos')
        .select('username, display_name, booth_id');

    if (blos) {
        console.log('\n─── BLOs in Database ───────────────────────────────');
        blos.forEach(b => console.log(`  ${b.username} → ${b.booth_id} (${b.display_name})`));
    }

    console.log('\n✅ Seeding complete!');
    console.log('═══════════════════════════════════════════════════');
}

seedBLOs().catch(err => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
});
