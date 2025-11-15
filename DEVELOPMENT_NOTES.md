# 🚧 Development Notes

## API Routes in Local Development

### ⚠️ Important Limitation

The **"Sync All Platforms"** button calls serverless API routes (`/api/codeforces`, `/api/leetcode`, `/api/codechef`) which are designed for **Vercel deployment**.

**These API routes will NOT work in local development** because:
- Vite dev server doesn't support serverless functions
- The `/api` folder is only processed by Vercel's build system
- You'll see 404 errors when trying to sync locally

### 🔧 Solutions

#### Option 1: Test on Vercel (Recommended)
1. Deploy to Vercel: `vercel deploy`
2. Set environment variables in Vercel dashboard:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY`
   - `CLIST_API_TOKEN`
3. Test sync functionality in production

#### Option 2: Use Vercel Dev Server Locally
```bash
npm install -g vercel
vercel dev
```
This runs a local Vercel environment that supports the API routes.

#### Option 3: Skip Sync in Development
- You can still test the UI/UX
- Database operations work fine
- Just manually insert test data into Supabase for testing:

```sql
-- Insert sample data in Supabase SQL Editor
INSERT INTO daily_stats (user_id, date, platform, solved_count)
VALUES 
  ('your-user-id-here', '2024-11-15', 'codeforces', 5),
  ('your-user-id-here', '2024-11-14', 'leetcode', 3),
  ('your-user-id-here', '2024-11-13', 'codechef', 2);
```

### ✅ What Works Locally

- ✅ Authentication (Supabase)
- ✅ Profile settings (save/load)
- ✅ Dashboard UI
- ✅ Analytics page
- ✅ Charts and visualizations
- ✅ Database queries

### ❌ What Requires Deployment

- ❌ Sync All Platforms button
- ❌ Platform data fetching
- ❌ Contests API

---

## Quick Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Follow prompts:
# - Link to existing project or create new
# - Set environment variables when prompted
# - Deploy!
```

After deployment, the sync functionality will work perfectly! 🚀
