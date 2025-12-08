#!/bin/bash
# Script để tự động thêm Supabase scripts vào HTML files

echo "🚀 Updating HTML files with Supabase scripts..."

# List of HTML files to update (except login.html)
FILES=("index.html" "admin.html" "workout.html" "nutrition.html" "schedule.html" "profile.html" "profile-student.html")

# Supabase scripts to add
SUPABASE_SCRIPT='<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>'
CONFIG_SCRIPT='<script src="config.js"></script>'

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "📝 Updating $file..."
        
        # Check if Supabase script already exists
        if ! grep -q "supabase-js" "$file"; then
            # Add Supabase script before closing </head>
            sed -i.bak "/<\/head>/i\\
$SUPABASE_SCRIPT\\
$CONFIG_SCRIPT
" "$file"
            echo "  ✅ Added Supabase scripts to $file"
        else
            echo "  ⏭️  $file already has Supabase scripts"
        fi
    else
        echo "  ⚠️  $file not found, skipping..."
    fi
done

echo ""
echo "✅ Done! Don't forget to:"
echo "   1. Run schema.sql in Supabase SQL Editor"
echo "   2. Rename config-supabase.js to config.js"
echo "   3. Migrate your data"
echo ""
echo "See SETUP-NOW.md for detailed instructions."

