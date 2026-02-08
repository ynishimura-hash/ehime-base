
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env.local') });

async function trigger() {
    const userId = "ae5bc5d7-604f-49c2-9097-5c4df0b71cdc";
    console.log('Triggering recommendations for user:', userId);

    if (!userId) {
        console.error('TEST_USER_ID not found in .env.local');
        // Fallback to a hardcoded user ID if needed, or ask user to provide one.
        // For now, let's try to fetch a user from supabase if possible, or just fail.
        return;
    }

    const payload = {
        userId: userId,
        selectedValues: [1, 2, 3] // Mock values: 柔軟な視点, etc.
    };

    try {
        const res = await fetch('http://localhost:3000/api/analysis/recommendations_v2', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        console.log('API Status:', res.status);
        console.log('Response:', JSON.stringify(data, null, 2));
    } catch (e) {
        console.error('Fetch error:', e);
    }
}

trigger();
