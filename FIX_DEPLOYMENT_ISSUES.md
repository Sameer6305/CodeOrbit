# 🚨 FIX ALL ISSUES - DEPLOYMENT TROUBLESHOOTING

## Current Issues & Solutions

### ❌ Problem: All data showing as 0
**Cause**: Environment variables not set in Vercel  
**Solution**: Add environment variables NOW

### ❌ Problem: Wrong contest names/times
**Cause**: CLIST_API_TOKEN not configured  
**Solution**: Add clist.by API token

### ❌ Problem: CodeChef data not showing in graphs
**Cause**: Supabase connection failing  
**Solution**: Configure SUPABASE credentials

---

## 🔧 IMMEDIATE FIX (5 minutes)

### Step 1: Add Environment Variables in Vercel

1. **Go to**: https://vercel.com/sameer-s-projects-06e61bca/code-orbit/settings/environment-variables

2. **Add each variable** (click "Add New"):

#### Variable 1:
- Name: `VITE_SUPABASE_URL`
- Value: `https://YOUR_PROJECT_ID.supabase.co`
- Environment: ✅ Production ✅ Preview ✅ Development

#### Variable 2:
- Name: `VITE_SUPABASE_ANON_KEY`
- Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (from Supabase)
- Environment: ✅ Production ✅ Preview ✅ Development

#### Variable 3:
- Name: `SUPABASE_URL`
- Value: `https://YOUR_PROJECT_ID.supabase.co` (same as above)
- Environment: ✅ Production ✅ Preview ✅ Development

#### Variable 4:
- Name: `SUPABASE_SERVICE_KEY`
- Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (service_role key from Supabase)
- Environment: ✅ Production ✅ Preview ✅ Development

#### Variable 5:
- Name: `CLIST_API_TOKEN`
- Value: `ApiKey YOUR_TOKEN_HERE` (from clist.by)
- Environment: ✅ Production ✅ Preview ✅ Development

### Step 2: Get Supabase Keys

1. Go to: https://supabase.com/dashboard
2. Select your CodeOrbit project
3. Go to: **Settings** → **API**
4. Copy:
   - **Project URL** (for SUPABASE_URL and VITE_SUPABASE_URL)
   - **anon public** key (for VITE_SUPABASE_ANON_KEY)
   - **service_role** key (for SUPABASE_SERVICE_KEY) ⚠️ KEEP SECRET!

### Step 3: Get clist.by API Token

1. Go to: https://clist.by
2. Sign up / Login
3. Go to: **API** section
4. Click "Create new token"
5. Copy the token (format: `ApiKey YOUR_TOKEN`)

### Step 4: Redeploy

After adding all variables:

```powershell
vercel --prod
```

Or in Vercel dashboard:
- Go to: https://vercel.com/sameer-s-projects-06e61bca/code-orbit
- Click **Deployments** tab
- Click ⋯ menu on latest deployment
- Click **Redeploy**

---

## ✅ After Redeployment - Test Everything

### 1. Sign Up / Login
- Create an account
- Login successfully
- Page refresh should NOT redirect to login

### 2. Settings Page
- Go to Settings
- Add your platform handles:
  - Codeforces username
  - LeetCode username  
  - CodeChef username
- Click **Save Changes**

### 3. Dashboard - Sync Data
- Click **"Sync All Platforms"** button
- Wait for sync to complete (shows success/error for each)
- Check that data appears:
  - ✅ Total Problems Solved (not 0)
  - ✅ Platform breakdown (LeetCode, Codeforces, CodeChef counts)
  - ✅ Current streaks (if you have activity)
  - ✅ Problem types chart
  - ✅ Badges count

### 4. Contests Widget
- Check upcoming contests section
- Verify:
  - ✅ Contest names are clean (no "LeetCode" prefix)
  - ✅ Times show correctly (12-hour format, AM/PM)
  - ✅ "Today", "Tomorrow", "In X days" displays

### 5. Analytics Page
- Go to Analytics
- Check:
  - ✅ Activity chart shows your data
  - ✅ Heatmap displays all platforms (including CodeChef)
  - ✅ Platform comparison is not all zeros

### 6. Benchmark Page
- Enter a competitor's username
- Click **Compare Performance**
- Verify:
  - ✅ Radar chart shows comparison
  - ✅ Streak battle displays
  - ✅ Not all zeros

---

## 🐛 If Still Having Issues

### Issue: Data still showing 0 after sync
**Check:**
1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Click "Sync All Platforms"
4. Look for API calls to `/api/leetcode`, `/api/codeforces`, `/api/codechef`
5. Check if they return 200 OK or error

**If 500 error:**
- Environment variables not set correctly
- Check Vercel logs: https://vercel.com/sameer-s-projects-06e61bca/code-orbit/logs

**If 404 error:**
- API routes not deployed
- Trigger a fresh deployment

### Issue: Contest names still wrong
**Check:**
1. CLIST_API_TOKEN is set correctly
2. Token format is: `ApiKey YOUR_TOKEN` (with space)
3. Redeploy after adding token

### Issue: CodeChef data missing
**Check:**
1. Your CodeChef username is correct
2. Profile is public (not private)
3. Sync completes without errors
4. Check `/api/submission-calendar` in Network tab

---

## 📝 Quick Commands

### Redeploy to Vercel:
```powershell
vercel --prod
```

### Check deployment status:
```powershell
vercel ls
```

### View logs:
```powershell
vercel logs
```

---

## 🎯 Expected Result After Fix

✅ **Dashboard shows real data**
- Total Problems: Your actual count (not 0)
- Streaks: Current streak (if active)
- Platform breakdown: Individual counts per platform

✅ **Contests display correctly**
- Clean names: "Weekly Contest 123" (not "LeetCode Weekly Contest 123")
- Proper times: "Nov 30, 8:00 PM" with "Tomorrow" label

✅ **Graphs work**
- Activity chart shows submission history
- Heatmap includes CodeChef data
- Platform comparison shows all three platforms

✅ **Benchmark comparison works**
- Can compare with other users
- Radar chart displays data
- Streak battle shows values

---

## 💡 Pro Tips

1. **Always sync after adding handles** - Click "Sync All Platforms" to fetch fresh data
2. **Refresh fixes most UI issues** - If data looks stuck, refresh the page
3. **Check Network tab for API errors** - DevTools is your friend
4. **Vercel logs show backend errors** - Check if APIs are failing
5. **Environment variables need redeploy** - Changes don't take effect until redeploy

---

## ✅ Checklist

- [ ] Added VITE_SUPABASE_URL
- [ ] Added VITE_SUPABASE_ANON_KEY
- [ ] Added SUPABASE_URL
- [ ] Added SUPABASE_SERVICE_KEY
- [ ] Added CLIST_API_TOKEN
- [ ] Redeployed to Vercel
- [ ] Tested signup/login
- [ ] Added platform handles in Settings
- [ ] Clicked "Sync All Platforms"
- [ ] Verified data shows correctly
- [ ] Checked contests display properly
- [ ] Tested benchmark comparison

Once ALL checked ✅ → Your app should work perfectly!
