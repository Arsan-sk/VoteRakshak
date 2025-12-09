import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createUser } from './utils/supabaseClient.js';
import { hashAadhaar } from './utils/blockchain.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from current directory
dotenv.config();

async function seed() {
    console.log('🌱 Starting seed process...');

    if (!process.env.SUPABASE_URL) {
        console.warn('⚠️  SUPABASE_URL is missing.');
    }

    const aadhar = '111122223333';

    // Check if AADHAAR_SALT is present
    if (!process.env.AADHAAR_SALT) {
        console.warn('⚠️  AADHAAR_SALT not found in env. Hashes might mismatch production if salt differs.');
    }

    const aadharHash = hashAadhaar(aadhar);

    const user = {
        id: `USER_${Date.now()}`,
        aadhar_hash: aadharHash,
        raw_aadhaar: aadhar,
        name_first: 'Test',
        name_middle: 'Integrity',
        name_last: 'User',
        age: 30,
        phone: '9876543210',
        photo: 'https://via.placeholder.com/150',
        biometric: {
            template_id: `TMPL_${Date.now()}`,
            template: 'DUMMY_FINGERPRINT_TEMPLATE',
        },
        has_voted: false,
        registered_at: new Date().toISOString(),
    };

    console.log(`Seeding user: ${aadhar}`);
    console.log(`Hash: ${aadharHash}`);

    try {
        const data = await createUser(user);
        console.log('✅ User seeded successfully!');
        console.log(data);
    } catch (err) {
        if (err.message && err.message.includes('duplicate key')) {
            console.log('⚠️  User already exists. Skipping insertion.');
        } else {
            console.error('❌ Failed to seed user:', err);
            // Log full error for debugging
            if (err.cause) console.error(err.cause);
        }
    }
}

seed();
