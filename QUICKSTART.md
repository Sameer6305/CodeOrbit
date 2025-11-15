# 🚀 CodeOrbit - Quick Start Guide

## How to Use CodeOrbit

### 1. Sign Up / Login
- Create an account with any email (e.g., `test@example.com`)
- Email confirmation is disabled for easy testing
- Or use Google OAuth for instant login

### 2. Add Your Coding Platforms

Go to **Settings** page and add your profiles. You can enter either:
- ✅ **Full Profile URL** (recommended)
- ✅ **Just your username**

#### Examples:

**Codeforces:**
```
https://codeforces.com/profile/tourist
OR
tourist
```

**LeetCode:**
```
https://leetcode.com/username
OR
username
```

**CodeChef:**
```
https://www.codechef.com/users/your_handle
OR
your_handle
```

### 3. Automatic Validation

As you type, CodeOrbit will:
- 🔍 **Extract username** from URL automatically
- ✅ **Validate** that the profile exists
- 🔗 **Show "View Profile"** link to verify

**Status Indicators:**
- 🔄 **Spinning loader** = Checking...
- ✅ **Green checkmark** = Profile found!
- ❌ **Red X** = Profile not found

### 4. Save Your Settings

Click **"Save Changes"** button to store your profiles.

### 5. Sync Your Data

Go back to **Dashboard** and click **"Sync Now"** on any platform card:

**What happens:**
1. Fetches all your submissions from the platform
2. Counts problems solved per day
3. Saves to database
4. Updates charts and statistics

### 6. View Your Analytics

After syncing, you'll see:
- 📊 **Total Problems Solved** across all platforms
- 🔥 **Current Streak** (consecutive days coding)
- 📈 **30-Day Activity Chart**
- 🗓️ **Contribution Heatmap** (GitHub-style)
- 🎯 **Platform Comparison** (Radar chart)

### 7. Upcoming Contests

The **Contests Widget** shows:
- 📅 Next 5 upcoming contests
- 🕐 Start time and duration
- 🔗 Direct links to register

**Quick Links:**
- Click **CF/LC/CC** links at the top to go directly to contest pages
- Click **View** button on any contest to register

---

## Features at a Glance

### ✨ Smart URL Parsing
- Paste full profile URL → Automatically extracts username
- Works with all major URL formats
- No need to manually copy username

### ✅ Real-time Validation
- Checks if profile exists on platform
- Shows rating/stats (for Codeforces)
- Instant feedback as you type

### 📊 Data Syncing
- **Codeforces**: Uses official API (all submissions)
- **LeetCode**: Uses GraphQL API (total solved)
- **CodeChef**: Scrapes profile page (no official API)

### 🎨 Beautiful Dashboard
- Dark/Light theme toggle
- Responsive design (works on mobile)
- Animated charts and cards
- Real-time data updates

---

## Platform-Specific Notes

### Codeforces
- ✅ Full API support
- ✅ Shows rating and rank
- ✅ Historical data available
- ✅ Per-day problem count

### LeetCode
- ✅ GraphQL API
- ✅ Total problems solved
- ⚠️ No per-day breakdown (API limitation)
- ✅ Fast and reliable

### CodeChef
- ⚠️ No official API
- ✅ Web scraping used
- ⚠️ May be slower
- ✅ Total problems count

---

## Tips & Tricks

### 💡 Syncing Best Practices
- Sync once per day (data doesn't change frequently)
- Sync all platforms to see complete stats
- Use "Refresh" button on dashboard to reload data

### 💡 Finding Your Profile URL
1. Go to the coding platform
2. Click on your profile
3. Copy the URL from browser address bar
4. Paste into CodeOrbit Settings

### 💡 Troubleshooting
- **Profile not found?** Check username spelling
- **Sync failed?** Verify username is correct
- **Charts empty?** Click "Sync Now" first
- **Contest links broken?** They load directly from platforms

---

## Example Workflow

```
1. Login to CodeOrbit
   ↓
2. Settings → Paste Codeforces URL
   ✅ "Found: tourist (3089)" appears
   ↓
3. Settings → Paste LeetCode URL  
   ✅ "Found: username" appears
   ↓
4. Click "Save Changes"
   ✅ "Saved Successfully!" message
   ↓
5. Dashboard → Click "Sync Now" on Codeforces
   ⏳ Fetching data...
   ✅ "Synced 247 problems!"
   ↓
6. View Charts
   📊 Heatmap shows your activity
   📈 Line chart shows 30-day trend
   🎯 Radar chart compares platforms
```

---

## Contest Registration

### How to Register for Contests

1. **From Dashboard:**
   - Scroll to "Upcoming Contests" widget
   - Click quick links: **CF / LC / CC** at the top
   - Opens contest page in new tab

2. **From Contest Card:**
   - Click **"View"** button on any contest
   - Redirects to registration page
   - Register as usual on the platform

3. **Direct Links:**
   - **Codeforces**: https://codeforces.com/contests
   - **LeetCode**: https://leetcode.com/contest/
   - **CodeChef**: https://www.codechef.com/contests

---

## Privacy & Data

- ✅ Your email is only used for login
- ✅ Platform usernames are public data
- ✅ Only syncs data YOU approve
- ✅ Data stored securely in Supabase
- ✅ No password access to coding platforms
- ✅ Uses official APIs (read-only)

---

## What's Next?

### Coming Soon Features 🚧
- 🏆 Achievements and Badges
- 👥 Friend Comparisons
- 📅 Weekly/Monthly Goals
- 📧 Contest Reminders
- 🔔 Notifications for milestones
- 📱 Mobile App

---

## Support

**Need Help?**
- Check the `DEPLOYMENT.md` guide for setup
- Open GitHub issue for bugs
- Read Supabase docs for database help
- Check platform API docs for limits

**Found a Bug?**
- Create GitHub issue
- Include screenshots
- Describe steps to reproduce

---

## Credits

Built with:
- ⚛️ React + Vite
- 🎨 Tailwind CSS
- 💾 Supabase
- 📊 Recharts
- 🎭 Framer Motion
- ☁️ Vercel

---

**Happy Coding! 🎉**

Track your progress, stay motivated, and keep solving! 💪
