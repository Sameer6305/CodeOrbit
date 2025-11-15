# 🚀 CodeOrbit Deployment Guide

This guide will help you deploy CodeOrbit to Vercel with full Supabase integration.

## Prerequisites

- GitHub account
- Vercel account (free tier works)
- Supabase account (free tier works)
- clist.by API key (free)

---

## Part 1: Supabase Setup

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in project details:
   - **Project Name**: codeorbit
   - **Database Password**: (Save this securely!)
   - **Region**: Choose closest to your users
4. Wait for project to finish setting up (~2 minutes)

### 1.2 Setup Database Tables

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the entire content of `supabase/schema.sql` from your project
3. Paste it into the SQL Editor
4. Click **Run** to execute the SQL script
5. Verify tables were created:
   - Go to **Table Editor**
   - You should see: `profiles`, `daily_stats`, `contests_cache`

### 1.3 Configure Authentication

1. Go to **Authentication** → **Providers**
2. **Email Provider**:
   - Enable "Email" provider
   - Disable "Confirm email" (for easier testing)
   - Save
3. **Google OAuth** (Optional but recommended):
   - Enable "Google" provider
   - Get Google OAuth credentials:
     - Go to [Google Cloud Console](https://console.cloud.google.com)
     - Create new project or select existing
     - Enable Google+ API
     - Create OAuth 2.0 credentials
     - Add authorized redirect URI: `https://<your-project>.supabase.co/auth/v1/callback`
   - Paste Client ID and Client Secret in Supabase
   - Save

### 1.4 Get API Keys

1. Go to **Project Settings** → **API**
2. Copy these values (you'll need them later):
   - **Project URL**: `https://<your-project>.supabase.co`
   - **anon/public key**: Starts with `eyJ...`
   - **service_role key**: Starts with `eyJ...` (keep this secret!)

---

## Part 2: Get clist.by API Token

1. Go to [clist.by](https://clist.by)
2. Sign up for free account
3. Go to **API** section
4. Generate API token
5. Copy your API token (format: `ApiKey <your-key>`)

---

## Part 3: Prepare Your Project

### 3.1 Update Environment Variables

Create a `.env` file in your project root (if not exists):

```env
# Supabase (Frontend - VITE_ prefix)
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Supabase (Backend - for API routes)
SUPABASE_URL=https://<your-project>.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# clist.by API
CLIST_API_TOKEN=ApiKey YOUR_TOKEN_HERE
```

⚠️ **Important**: Make sure `.env` is in `.gitignore` - NEVER commit secrets to git!

### 3.2 Test Locally

```powershell
# Install dependencies (if not done)
npm install

# Run development server
npm run dev
```

Open http://localhost:5173 and test:
- ✅ Sign up / Login works
- ✅ Can save platform handles in Settings
- ✅ Dashboard loads without errors
- ✅ Dark/Light theme toggle works

---

## Part 4: Deploy to Vercel

### 4.1 Push to GitHub

```powershell
# Initialize git (if not done)
git init
git add .
git commit -m "Initial commit"

# Create GitHub repo and push
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### 4.2 Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure Project:
   - **Framework Preset**: Vite
   - **Root Directory**: ./
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### 4.3 Add Environment Variables in Vercel

1. In project settings, go to "Environment Variables"
2. Add each variable from your `.env` file:

| Name | Value | Environment |
|------|-------|-------------|
| `VITE_SUPABASE_URL` | https://your-project.supabase.co | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | eyJhbGci... | Production, Preview, Development |
| `SUPABASE_URL` | https://your-project.supabase.co | Production, Preview, Development |
| `SUPABASE_SERVICE_KEY` | eyJhbGci... | Production, Preview, Development |
| `CLIST_API_TOKEN` | ApiKey ... | Production, Preview, Development |

3. Click "Save" after each variable

### 4.4 Deploy

1. Click "Deploy"
2. Wait for build to complete (~2-3 minutes)
3. Your app will be live at: `https://your-app.vercel.app`

---

## Part 5: Configure Custom Domain (Optional)

### 5.1 Add Domain in Vercel

1. In your Vercel project, go to **Settings** → **Domains**
2. Add your domain: `codeorbit.yourdomain.com`
3. Vercel will provide DNS records

### 5.2 Update DNS

Add these records in your domain provider:

**Option A: Subdomain (recommended)**
```
Type: CNAME
Name: codeorbit
Value: cname.vercel-dns.com
```

**Option B: Root domain**
```
Type: A
Name: @
Value: 76.76.19.19

Type: A
Name: @
Value: 76.76.19.21
```

### 5.3 Update Supabase Redirect URLs

1. Go to Supabase → **Authentication** → **URL Configuration**
2. Add your custom domain to **Redirect URLs**:
   ```
   https://codeorbit.yourdomain.com/**
   ```

---

## Part 6: Post-Deployment Testing

### 6.1 Test Core Features

Visit your deployed app and verify:

✅ **Authentication**
- Sign up with email
- Login with email
- Google OAuth (if enabled)
- Logout

✅ **Settings Page**
- Can save Codeforces handle
- Can save LeetCode username
- Can save CodeChef handle
- Data persists after refresh

✅ **Dashboard**
- Stats display correctly
- Charts render properly
- Sync cards appear when handles are configured
- Theme toggle works

✅ **Sync Functionality**
- Click sync on Codeforces card
- Should fetch data from API
- Data should appear in dashboard after sync

### 6.2 Test API Routes

You can test API routes directly:

```
https://your-app.vercel.app/api/codeforces?handle=tourist&user_id=YOUR_USER_ID

https://your-app.vercel.app/api/contests

https://your-app.vercel.app/api/leetcode?username=yourname&user_id=YOUR_USER_ID

https://your-app.vercel.app/api/codechef?handle=yourhandle&user_id=YOUR_USER_ID
```

---

## Part 7: Monitoring & Troubleshooting

### 7.1 View Logs

**Vercel Logs:**
- Project → **Deployments** → Click deployment → **Functions** tab
- Check for errors in API routes

**Supabase Logs:**
- **Database** → **Logs** → View queries
- **Auth** → **Logs** → View authentication events

### 7.2 Common Issues

**Issue: "Missing environment variables"**
- Solution: Double-check all env vars are set in Vercel
- Redeploy after adding variables

**Issue: "CORS errors"**
- Solution: Ensure Supabase URL is correct
- Check if domain is added to Supabase allowed origins

**Issue: "API routes return 404"**
- Solution: Ensure `api/` folder is at project root
- Vercel automatically deploys files in `api/` as serverless functions

**Issue: "Database connection failed"**
- Solution: Verify `SUPABASE_SERVICE_KEY` is correct
- Check if database is active in Supabase dashboard

**Issue: "Sync not working"**
- Solution: Check API route logs in Vercel
- Ensure platform handles are saved in database
- Verify user_id is being passed correctly

---

## Part 8: Performance Optimization

### 8.1 Enable Caching

The contest API automatically caches results. No action needed.

### 8.2 Optimize Images

If you add profile pictures later:
```javascript
// Use Next.js Image or similar
import Image from 'next/image'
```

### 8.3 Monitor Usage

- Vercel: **Analytics** → View function invocations
- Supabase: **Database** → View query performance
- clist.by: Check API rate limits

---

## 🎉 You're Done!

Your CodeOrbit app is now live and fully functional!

**Next Steps:**
- Share with friends
- Add more platform integrations (AtCoder, HackerRank)
- Implement weekly goals and achievements
- Add social features (leaderboards, friend comparisons)

**Support:**
- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- GitHub Issues: Create issue in your repository

---

## Quick Command Reference

```powershell
# Local Development
npm run dev                 # Start dev server
npm run build              # Build for production
npm run preview            # Preview production build
npm test                   # Run tests

# Git Commands
git add .
git commit -m "message"
git push

# Vercel CLI (optional)
npm i -g vercel
vercel                     # Deploy from CLI
vercel --prod             # Deploy to production
vercel env pull           # Download env variables
```
