import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createUser } from '../server/utils/supabaseClient.js';
import { hashAadhaar } from '../server/utils/blockchain.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from server directory
dotenv.config({ path: path.join(__dirname, '../server/.env') });

async function seed() {
    console.log('🌱 Starting seed process...');

    if (!process.env.SUPABASE_URL) {
        console.warn('⚠️  SUPABASE_URL is missing. Please ensure server/.env exists and is populated.');
    }

    const aadhar = '111122223333';

    // Use the utility to hash ensuring SALT is used
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
        }
    }
}

seed();
