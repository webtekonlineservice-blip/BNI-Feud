# 🚀 Deploy to Vercel - BNI Feud

## Current Production Status

Your BNI Feud game is deployed on Vercel:
- **Primary Domain**: https://bni.webtek.ai
- **Vercel Domain**: https://bni-feud.vercel.app
- **GitHub**: github.com/webtekonlineservice-blip
- **Branch**: `main`
- **Last Deploy**: Aug 28 - commit `2ab5e1c`

## What's New (Ready to Deploy)

### 1. 🎨 Professional Favicon
- New BNI-branded favicon with game show theme
- Blue gradient background, orange accent stripe
- SVG format - looks perfect on all devices
- Files: `public/img/favicon.svg`

### 2. 📝 Original Questions (No More "Name...")
- 24 completely rewritten questions
- ZERO questions starting with "Name..."
- Varied formats: What, Which, Where, Fill-in-the-blank, Complete, Statements
- Much more engaging and interesting
- See: `ORIGINAL_QUESTIONS_SUMMARY.md`

### 3. 👤 New Member Added
- Jasmine G. McKinney (Insurance - Simple Senior Benefits)
- 2 questions created for her
- Database already updated

### 4. 🏆 End-Game Modal
- Automatic modal when game completes
- **Winners & Stats Tab**: Winner announcement, podium, leaderboard, game stats
- **Answer Walk-Through Tab**: Review all questions with answers
- Professional game conclusion experience
- See: `END_GAME_MODAL_FEATURE.md`

## How to Deploy

### Option 1: Push to GitHub (Automatic Deployment)

Since Vercel is connected to your GitHub repo, it will auto-deploy when you push to `main`:

```bash
# 1. Add remote if not already set (get actual repo URL from GitHub)
git remote add origin https://github.com/webtekonlineservice-blip/BNI-Feud.git

# 2. Stage all changes
git add .

# 3. Commit with descriptive message
git commit -m "feat: add favicon, original questions, end-game modal, new member"

# 4. Push to main branch
git push origin main
```

Vercel will automatically:
- Detect the push
- Build the project
- Deploy to production
- Update https://bni.webtek.ai

### Option 2: Deploy via Vercel CLI

If you have the Vercel CLI installed:

```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Deploy to production
vercel --prod
```

### Option 3: Manual Deploy via Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Find your "bni-feud" project
3. Go to "Deployments" tab
4. Click "Deploy" → "Redeploy"

## Deployment Checklist

Before deploying, verify:

- [x] ✅ Build successful locally (`npm run build`)
- [x] ✅ All new features tested locally
- [x] ✅ Environment variables set in Vercel:
  - Firebase credentials
  - Supabase credentials
  - Twilio credentials (if used)
  - OpenAI API key (if used)
- [x] ✅ Database updated (Jasmine G. McKinney added)
- [x] ✅ Questions updated (24 original questions)

## Environment Variables

Make sure these are set in Vercel Dashboard → Settings → Environment Variables:

```
FIREBASE_PROJECT_ID=linked-in-test-7cfa8
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY=...
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

(Copy from your `.env.local` file)

## Git Setup (If Starting Fresh)

If your git repo isn't connected to GitHub yet:

```bash
# 1. Initialize git (already done)
git init

# 2. Get your GitHub repo URL from:
#    https://github.com/webtekonlineservice-blip

# 3. Add remote
git remote add origin [YOUR_GITHUB_REPO_URL]

# 4. Create initial commit
git add .
git commit -m "feat: add favicon, original questions, end-game modal, new member"

# 5. Push to main
git branch -M main
git push -u origin main
```

## Verifying Deployment

After deployment completes (usually 1-2 minutes):

1. **Check Vercel Dashboard**
   - Status should show "Ready" with green checkmark
   - Build logs should show "Build Completed"

2. **Visit Production URLs**
   - https://bni.webtek.ai
   - https://bni-feud.vercel.app

3. **Verify New Features**
   - ✅ Look at browser tab - new favicon visible
   - ✅ Check questions - no "Name..." questions
   - ✅ See Jasmine G. McKinney in members list
   - ✅ Complete a game - end-game modal should appear

## Quick Commands

```bash
# Check git status
git status

# View what changed
git diff

# Stage all changes
git add .

# Commit changes
git commit -m "your message"

# Push to production (triggers Vercel deploy)
git push origin main

# Check Vercel deployment status
vercel ls
```

## Troubleshooting

### Build Fails on Vercel

**Check build logs in Vercel Dashboard:**
- Go to Deployments → Click failed deployment → View logs
- Common issues:
  - Missing environment variables
  - TypeScript errors
  - Missing dependencies

**Solution:**
```bash
# Test build locally first
npm run build

# If it works locally but fails on Vercel, check:
# 1. Environment variables in Vercel Dashboard
# 2. Node version in Vercel matches local (Node 18 or 20)
```

### Environment Variables Not Working

1. Go to Vercel Dashboard → Settings → Environment Variables
2. Make sure variables are set for "Production" environment
3. After adding variables, trigger a redeploy

### Database Not Updated on Production

The database changes (new member, new questions) are in **Firebase Firestore**, not in the codebase. They're already live! The deployment will just update the frontend code.

## What Gets Deployed

When you deploy, Vercel will deploy:
- ✅ Frontend code (React/Next.js)
- ✅ API routes (serverless functions)
- ✅ Static assets (images, icons)
- ✅ Configuration

**NOT deployed** (already live in Firebase):
- ❌ Database data (questions, members)
- ❌ Firebase rules

## Summary

**To deploy your updates:**

1. Push code to GitHub `main` branch
2. Vercel automatically builds and deploys
3. Check https://bni.webtek.ai for updates

**New features will be live:**
- Professional favicon
- 24 original questions
- Jasmine G. McKinney
- End-game modal with stats and walk-through

---

**Need help?** Check Vercel deployment logs at: https://vercel.com/dashboard
