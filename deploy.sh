#!/bin/bash

# =======================================================
# Quick Deploy Script for GitHub Pages
# =======================================================

echo "🚀 PT Manager - GitHub Pages Deploy"
echo "===================================="
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "📦 Initializing git repository..."
    git init
    echo "✅ Git initialized"
    echo ""
fi

# Check if .gitignore exists
if [ ! -f .gitignore ]; then
    echo "📝 Creating .gitignore..."
    cat > .gitignore << 'EOF'
# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# Logs
*.log
npm-debug.log*

# Environment
.env
.env.local
EOF
    echo "✅ .gitignore created"
    echo ""
fi

# Check if .nojekyll exists
if [ ! -f .nojekyll ]; then
    echo "📝 Creating .nojekyll..."
    touch .nojekyll
    echo "✅ .nojekyll created"
    echo ""
fi

# Add all files
echo "📦 Adding files..."
git add .
echo "✅ Files added"
echo ""

# Check if there are changes
if git diff --staged --quiet; then
    echo "ℹ️  No changes to commit"
else
    echo "💾 Committing changes..."
    git commit -m "Deploy PT Manager to GitHub Pages - $(date +%Y-%m-%d)"
    echo "✅ Committed"
    echo ""
fi

# Check remote
if git remote | grep -q origin; then
    REMOTE_URL=$(git remote get-url origin)
    echo "🔗 Remote: $REMOTE_URL"
    echo ""
    echo "📤 Pushing to GitHub..."
    git push -u origin main 2>&1 || git push -u origin master 2>&1
    echo ""
    echo "✅ Deployed!"
    echo ""
    echo "📝 Next steps:"
    echo "   1. Vào GitHub repository"
    echo "   2. Settings → Pages"
    echo "   3. Enable GitHub Pages (branch: main, folder: /)"
    echo "   4. Cấu hình CORS trong Supabase Dashboard"
    echo ""
else
    echo "⚠️  Chưa có remote repository"
    echo ""
    echo "📝 Tạo repository trên GitHub trước:"
    echo "   1. Vào https://github.com/new"
    echo "   2. Tạo repository mới"
    echo "   3. Chạy lệnh sau (thay YOUR_USERNAME và REPO_NAME):"
    echo ""
    echo "   git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git"
    echo "   git branch -M main"
    echo "   ./deploy.sh"
    echo ""
fi

