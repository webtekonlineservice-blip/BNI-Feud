#!/bin/bash

echo "🚀 BNI Feud - Deploy to Production"
echo "=================================="
echo ""

# Check if remote exists
if git remote get-url origin >/dev/null 2>&1; then
    echo "✅ Git remote found"
    echo "   Remote: $(git remote get-url origin)"
else
    echo "⚠️  No git remote configured"
    echo ""
    echo "Please add your GitHub repository as remote:"
    echo "   git remote add origin https://github.com/webtekonlineservice-blip/[repo-name].git"
    echo ""
    echo "Or find your repo URL from:"
    echo "   https://github.com/webtekonlineservice-blip"
    exit 1
fi

echo ""
echo "📦 Staging changes..."
git add .

echo ""
echo "📝 Creating commit..."
git commit -m "feat: add favicon, original questions, end-game modal, new member Jasmine McKinney

- Added professional BNI-branded favicon with game show theme
- Rewrote all 24 questions with original varied formats (no more 'Name...')
- Added end-game modal with winners, stats, and answer walk-through
- Added new member: Jasmine G. McKinney (Insurance - Simple Senior Benefits)
- Created comprehensive documentation"

echo ""
echo "🚀 Pushing to main branch..."
git push origin main

echo ""
echo "✅ Done!"
echo ""
echo "Vercel will now automatically:"
echo "  1. Detect the push"
echo "  2. Build the project"
echo "  3. Deploy to production"
echo ""
echo "Check deployment status at:"
echo "  https://vercel.com/dashboard"
echo ""
echo "Your site will be live at:"
echo "  https://bni.webtek.ai"
echo "  https://bni-feud.vercel.app"
