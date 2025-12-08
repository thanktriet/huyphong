// Quick Supabase Connection Test
// Chạy trong browser console hoặc Node.js (với fetch)

const SUPABASE_URL = 'https://opjagtkygfgiokuaveje.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wamFndGt5Z2ZnaW9rdWF2ZWplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxNTc3NzgsImV4cCI6MjA4MDczMzc3OH0.Hoembak7nFXUQ4ZhETnvJg2OETkPibkU1YJbxlrqKtM';

async function testConnection() {
    console.log('🔌 Testing Supabase Connection...\n');

    // Test 1: Simple query
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/users?select=id&limit=1`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log('✅ Connection OK!');
            console.log(`   Found ${data.length} user(s)`);
        } else {
            console.log('❌ Connection Failed!');
            console.log(`   Status: ${response.status}`);
            console.log(`   Error: ${await response.text()}`);
        }
    } catch (error) {
        console.log('❌ Connection Error:', error.message);
    }

    // Test 2: Check tables
    console.log('\n📊 Checking Tables...');
    const tables = ['users', 'exercise_library', 'food_library', 'workout_plans'];
    
    for (const table of tables) {
        try {
            const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=count&limit=1`, {
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Prefer': 'count=exact'
                }
            });

            if (response.ok) {
                const count = response.headers.get('content-range')?.split('/')[1] || '?';
                console.log(`   ✅ ${table}: OK (${count} rows)`);
            } else {
                console.log(`   ❌ ${table}: ${response.status}`);
            }
        } catch (error) {
            console.log(`   ❌ ${table}: ${error.message}`);
        }
    }
}

// Run test
testConnection();

