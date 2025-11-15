# 🚀 Complete Supabase Setup Guide

## Prerequisites
- Supabase account created
- Project created: `vnsroavhkhfhtqbykgbh`
- Database ready to use

---

## 📋 Step-by-Step Setup

### **Step 1: Open Supabase SQL Editor**

1. Go to: https://supabase.com/dashboard
2. Select your project: **vnsroavhkhfhtqbykgbh**
3. Click **SQL Editor** in the left sidebar
4. Click **New Query** button

---

### **Step 2: Run the Complete Schema**

1. Open the file: `supabase/schema.sql`
2. **Copy the ENTIRE file contents** (all 200+ lines)
3. **Paste** into the Supabase SQL Editor
4. Click the **RUN** button (or press `Ctrl+Enter`)

**Expected Output:**
```
Success. No rows returned
```

---

### **Step 3: Verify Setup (Optional but Recommended)**

Run this verification query in a new SQL Editor tab:

```sql
-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'daily_stats', 'contests_cache');

-- Should return 3 rows:
-- profiles
-- daily_stats
-- contests_cache
```

Run this to check profiles table structure:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- Should return 8 columns:
-- id (uuid)
-- email (text)
-- username (text)
-- codeforces_handle (text)
-- leetcode_username (text)
-- codechef_handle (text)
-- created_at (timestamp with time zone)
-- updated_at (timestamp with time zone)
```

---

### **Step 4: Disable Email Confirmation (Important!)**

1. In Supabase Dashboard, go to **Authentication** → **Providers**
2. Scroll down to **Email** provider
3. Find **"Confirm email"** toggle
4. **Turn it OFF** (disable it)
5. Click **Save**

**Why?** This allows instant signup without email verification (good for development/testing)

---

### **Step 5: Configure Google OAuth (Optional)**

If you want Google Sign-In:

1. Go to **Authentication** → **Providers**
2. Click **Google** provider
3. Toggle **Enable Sign in with Google**
4. Follow the setup wizard to get Client ID and Secret from Google Console
5. Save the configuration

---

## ✅ What Was Created?

### **Tables:**
1. **`profiles`** - Stores user platform handles (Codeforces, LeetCode, CodeChef)
2. **`daily_stats`** - Stores daily problem-solving counts per platform
3. **`contests_cache`** - Caches upcoming contest information

### **Security:**
- ✓ Row Level Security (RLS) enabled on all tables
- ✓ Users can only access their own data
- ✓ Service role (API) can insert/update stats

### **Automation:**
- ✓ Auto-creates profile when user signs up
- ✓ Auto-updates `updated_at` timestamps
- ✓ Foreign key constraints ensure data integrity

### **Indexes:**
- ✓ Fast queries on user_id + date
- ✓ Fast queries on contest start times

---

## 🧪 Test Your Setup

### **1. Sign Up**
1. Go to http://localhost:5177
2. Click **Sign Up**
3. Create account with email/password
4. You should be logged in automatically

### **2. Add Platform URLs**
1. Go to **Settings** page
2. Add your profile URLs:
   - Codeforces: `https://codeforces.com/profile/tourist`
   - LeetCode: `https://leetcode.com/u/your-username/`
   - CodeChef: `https://www.codechef.com/users/your-username`
3. Click **Save Settings**
4. Should see "Settings saved successfully!"

### **3. Sync Data**
1. Go to **Dashboard**
2. Click **Sync All Platforms** button
3. Wait for sync to complete
4. You should see:
   - ✓ Codeforces: Synced X days of data
   - ✓ LeetCode: Synced X days of data
   - ✓ CodeChef: Synced X days of data
5. Dashboard should update with your stats

---

## 🔍 Troubleshooting

### **Error: "relation 'profiles' does not exist"**
- You didn't run the schema.sql file
- Solution: Run Step 2 again

### **Error: "duplicate key value violates unique constraint"**
- You're trying to run schema.sql again
- Solution: The new schema.sql has DROP statements - it will clean up and recreate everything

### **Error: "Could not find the 'codechef_handle' column"**
- Schema wasn't run properly
- Solution: Run Step 3 verification queries to check columns exist

### **Email confirmation blocking signup**
- You didn't disable email confirmation
- Solution: Complete Step 4

### **Sync not working**
- Check your `.env` file has correct Supabase keys
- Make sure `SUPABASE_SERVICE_KEY` is set (not just anon key)
- Restart dev server after changing `.env`

---

## 🎯 What's Next?

After setup is complete:

1. ✅ Database is ready
2. ✅ Auth is configured
3. ✅ RLS policies protect user data
4. ✅ App can sync platform data

**You're ready to use CodeOrbit!** 🚀

---

## 📝 Environment Variables Checklist

Make sure your `.env` file has:

```env
VITE_SUPABASE_URL=https://vnsroavhkhfhtqbykgbh.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_URL=https://vnsroavhkhfhtqbykgbh.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (different from anon key!)
CLIST_API_TOKEN=your_clist_token_here
```

**Where to find keys:**
- Supabase Dashboard → Settings → API
- `anon` key = public client key
- `service_role` key = server-side key (keep secret!)

---

## 🔄 If You Need to Reset Everything

Run this in SQL Editor to completely reset:

```sql
-- WARNING: This deletes ALL data!
DROP TABLE IF EXISTS contests_cache CASCADE;
DROP TABLE IF EXISTS daily_stats CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
```

Then run `schema.sql` again to recreate everything fresh.

---

**Need help?** Check the error messages in browser console (F12) or Supabase logs.
