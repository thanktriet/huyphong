// =======================================================
// Auto Fix Supabase RLS Recursion
// Chạy script này trong browser console hoặc Node.js
// =======================================================

const SUPABASE_URL = 'https://opjagtkygfgiokuaveje.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wamFndGt5Z2ZnaW9rdWF2ZWplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxNTc3NzgsImV4cCI6MjA4MDczMzc3OH0.Hoembak7nFXUQ4ZhETnvJg2OETkPibkU1YJbxlrqKtM';

// ⚠️ LƯU Ý: Cần Service Role Key để chạy SQL
// Lấy từ: Supabase Dashboard → Settings → API → service_role key
// ⚠️ SECURITY: Service Role Key đã bị xóa khỏi code
// Vui lòng set environment variable hoặc nhập trực tiếp khi chạy
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';
// Hoặc nhập trực tiếp: const SUPABASE_SERVICE_KEY = 'YOUR_SERVICE_KEY_HERE';

async function runSQL(sql) {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_SERVICE_KEY,
                'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query: sql })
        });

        if (!response.ok) {
            // Fallback: Dùng PostgREST query builder
            throw new Error('RPC not available, using alternative method');
        }

        return await response.json();
    } catch (error) {
        // Alternative: Dùng Management API hoặc direct SQL
        console.warn('RPC method failed, trying alternative...');
        throw error;
    }
}

async function fixRLS() {
    console.log('🔧 Fixing RLS Recursion...\n');

    const fixSQL = `
        -- Drop old policy có vấn đề
        DROP POLICY IF EXISTS "PT can manage users" ON users;
        
        -- Tạo policy mới không có recursion
        CREATE POLICY IF NOT EXISTS "Allow all users manage" ON users FOR ALL USING (true);
    `;

    try {
        // Method 1: Thử dùng Supabase Management API
        console.log('⚠️ Không thể tự động chạy SQL từ browser.');
        console.log('📋 Vui lòng chạy SQL sau trong Supabase SQL Editor:\n');
        console.log(fixSQL);
        console.log('\n✅ Hoặc copy file: supabase/fix-rls-recursion.sql\n');
        
        return false;
    } catch (error) {
        console.error('❌ Error:', error);
        return false;
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { fixRLS, runSQL };
}

// Auto-run if in browser
if (typeof window !== 'undefined') {
    window.fixRLS = fixRLS;
    console.log('💡 Chạy: fixRLS() để xem hướng dẫn');
}

