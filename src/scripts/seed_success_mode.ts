
import dotenv from 'dotenv';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Load env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function seedSuccessMode() {
    console.log('Seeding Success Mode Data (Distorted x 5 Values) for test_seeker...');
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) throw new Error('Missing Admin Keys');
    const supabase = createClient(url, key);

    const email = 'test_seeker@example.com';
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const user = users.find(u => u.email === email);

    if (!user) {
        console.error('User not found:', email);
        return;
    }

    // Distorted Scores (Requested Pattern: 5, 3, 2, 4, 3)
    // A: 5 (High)
    // B: 3 (Mid)
    // C: 2 (Low)
    // D: 4 (High)
    // E: 3 (Mid)
    const diagnosisScores: Record<number, number> = {};

    // A (1-10) -> 5
    for (let i = 1; i <= 10; i++) diagnosisScores[i] = 5;
    // B (11-20) -> 3
    for (let i = 11; i <= 20; i++) diagnosisScores[i] = 3;
    // C (21-30) -> 2
    for (let i = 21; i <= 30; i++) diagnosisScores[i] = 2;
    // D (31-40) -> 4
    for (let i = 31; i <= 40; i++) diagnosisScores[i] = 4;
    // E (41-50) -> 3
    for (let i = 41; i <= 50; i++) diagnosisScores[i] = 3;

    // 5 Selected Values
    // Picking from High score categories (A and D) + one E for variety
    const selectedValues = [
        1,  // 好奇心旺盛 (A)
        3,  // 独創的 (A)
        61, // 共感力 (D)
        63, // 親しみやすさ (D)
        81  // 泰然自若 (E)
    ];

    const payload = {
        user_id: user.id,
        diagnosis_scores: diagnosisScores,
        selected_values: selectedValues,
        public_values: [1, 61, 81], // Top 3
        is_fortune_integrated: true,
        fortune_traits: ['Ambitions', 'Resilience']
    };

    const { error } = await supabase
        .from('user_analysis')
        .upsert(payload);

    if (error) {
        console.error('Update failed:', error);
    } else {
        console.log('Success Mode Data Updated with 5 Values & Spiky Chart!');
    }
}

seedSuccessMode();
