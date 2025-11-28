# CodeOrbit - Project Report

**Project Name:** CodeOrbit - Competitive Programming Progress Tracker  
**Developer:** Sameer Kadam  
**Repository:** https://github.com/Sameer6305/CodeOrbit  
**Production URL:** https://codeorbit.vercel.app  
**Date:** November 28, 2025

---

## 1. EXECUTIVE SUMMARY

CodeOrbit is a full-stack web application that helps competitive programmers track and analyze their coding performance across multiple platforms (LeetCode, Codeforces, and CodeChef). The application provides unified dashboards, visual analytics, peer comparison features, and upcoming contest notifications—all in one place.

**Key Highlights:**
- 🎯 Multi-platform integration (3 major coding platforms)
- 📊 Real-time data visualization with interactive charts
- 🏆 Peer comparison and benchmarking capabilities
- 📅 Upcoming contests aggregator
- 🔄 One-click data synchronization
- 📱 Fully responsive design

---

## 2. PROBLEM STATEMENT

Competitive programmers face several challenges:
- Managing profiles across multiple platforms (LeetCode, Codeforces, CodeChef)
- No unified view of overall progress
- Difficulty tracking streaks and consistency
- Missing contests due to scattered schedules
- Unable to compare performance with peers

**Solution:** CodeOrbit provides a centralized platform to aggregate data, visualize progress, enable comparisons, and never miss a contest.

---

## 3. TECHNOLOGY STACK

### Frontend
- **Framework:** React 18.3.1 with Vite
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Routing:** React Router DOM

### Backend
- **Runtime:** Node.js
- **Serverless:** Vercel Functions
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth

### APIs Integrated
- LeetCode GraphQL API
- Codeforces REST API
- CodeChef (Web Scraping)
- Clist.by API (Contests)

### Tools
- **Version Control:** Git & GitHub
- **Deployment:** Vercel
- **Package Manager:** npm

---

## 4. SYSTEM ARCHITECTURE

```
┌─────────────────────────────────┐
│     Frontend (React + Vite)     │
│   Dashboard | Analytics | More   │
└──────────────┬──────────────────┘
               │
               ↓
┌─────────────────────────────────┐
│   API Layer (Vercel Functions)  │
│  LeetCode | Codeforces | More   │
└──────────────┬──────────────────┘
               │
               ↓
┌─────────────────────────────────┐
│  Database (Supabase PostgreSQL) │
│    Users | Profiles | Activity  │
└─────────────────────────────────┘
```

**Data Flow:**
1. User authenticates via Supabase
2. Frontend requests data sync
3. Serverless functions fetch from platform APIs
4. Data normalized and stored in database
5. Frontend displays visualizations

---

## 5. KEY FEATURES

### 5.1 Dashboard
- **Statistics Cards:** Total problems, current streaks, badges, problem types
- **Activity Heatmap:** GitHub-style year-long contribution calendar
- **Activity Graph:** 12-month view with 3 platform lines
- **Sync All Button:** One-click synchronization of all platforms
- **Contest Widget:** Displays next 5 upcoming contests

### 5.2 Analytics Page
- **Personal Stats:** Total solved, active days, current/longest streaks
- **Visual Charts:**
  - Last 7 days activity (stacked bar chart)
  - Difficulty distribution (pie chart - Easy/Medium/Hard)
- **Comparison Feature:**
  - Input competitor handles
  - Side-by-side comparison
  - Radar chart visualization
  - Winner indicators

### 5.3 Benchmark Page
- Dedicated comparison interface
- Multiple platform inputs
- Performance radar chart
- Streak comparison bars
- Platform-wise leader indicators

### 5.4 Contests Page
- Real-time contest data from all platforms
- Start time with relative indicators (Today/Tomorrow/In X days)
- Duration and platform badges
- Direct registration links

### 5.5 Settings
- Add/update platform handles
- Profile management
- Theme preferences

---

## 6. CORE ALGORITHMS

### 6.1 Streak Calculation
```
Algorithm:
1. Fetch all activity records sorted by date
2. Identify days where problem count increased (activity occurred)
3. For Current Streak:
   - Start from today, count consecutive days backwards
   - Stop at first gap
4. For Longest Streak:
   - Scan entire history
   - Track longest consecutive sequence
```

### 6.2 Data Aggregation
```
Process:
1. Parallel API calls to all 3 platforms
2. Normalize different response formats
3. Merge by date for unified view
4. Calculate combined metrics
5. Store with timestamp in database
```

### 6.3 Comparison Logic
```
Steps:
1. Fetch data for both users
2. Calculate: total solved, streaks, platform breakdown
3. Determine winner for each metric
4. Generate radar chart data
5. Apply color coding (green=winner, blue=opponent)
```

---

## 7. API ENDPOINTS

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/leetcode` | GET | Fetch LeetCode stats |
| `/api/codeforces` | GET | Fetch Codeforces data |
| `/api/codechef` | GET | Fetch CodeChef data |
| `/api/contests` | GET | Get upcoming contests |
| `/api/badges` | GET | Fetch user badges |
| `/api/problem-types` | GET | Get difficulty breakdown |
| `/api/compare` | GET | Compare two users |

---

## 8. DATABASE SCHEMA

### Key Tables:
- **users:** Authentication and user info
- **profiles:** Platform handles (leetcode_username, codeforces_handle, codechef_handle)
- **daily_stats:** Daily problem counts per platform
- **contests_cache:** Cached contest data
- **streaks:** Current and historical streak data

---

## 9. PROJECT STRUCTURE

```
codeorbit/
├── api/                    # Serverless functions
│   ├── leetcode.js
│   ├── codeforces.js
│   ├── codechef.js
│   ├── contests.js
│   ├── compare.js
│   ├── badges.js
│   └── problem-types.js
├── src/
│   ├── components/        # Reusable UI components
│   ├── pages/            # Main pages
│   │   ├── Dashboard.jsx
│   │   ├── Analytics.jsx
│   │   ├── Benchmark.jsx
│   │   ├── Contests.jsx
│   │   └── Settings.jsx
│   ├── store/            # State management
│   └── utils/            # Helper functions
├── public/               # Static assets
├── package.json
├── vite.config.js
└── vercel.json          # Deployment config
```

---

## 10. IMPLEMENTATION HIGHLIGHTS

### 10.1 Technical Achievements
- **Seamless Integration:** Successfully integrated 3 different API formats
- **Real-time Sync:** Efficient data synchronization with minimal latency
- **Responsive Design:** Works flawlessly on desktop, tablet, and mobile
- **Serverless Architecture:** Auto-scaling with Vercel functions
- **Performance:** Fast load times (~2s initial, <500ms subsequent)

### 10.2 Key Challenges Solved

| Challenge | Solution |
|-----------|----------|
| Different API formats | Built normalization layer |
| CodeChef lacks API | Implemented web scraping |
| Complex streak logic | Developed robust algorithm |
| Real-time updates | Implemented caching strategy |
| Responsive charts | Used Recharts with custom configs |

---

## 11. USER WORKFLOW

```
1. Sign Up/Login
   ↓
2. Add Platform Handles (Settings)
   ↓
3. Click "Sync All" (Dashboard)
   ↓
4. View Statistics & Visualizations
   ↓
5. Compare with Others (Analytics/Benchmark)
   ↓
6. Check Upcoming Contests
   ↓
7. Regular Syncs to Track Progress
```

---

## 12. TESTING & QUALITY ASSURANCE

### Testing Coverage:
- ✅ All features manually tested
- ✅ Cross-browser compatibility (Chrome, Firefox, Safari, Edge)
- ✅ Responsive design on multiple devices
- ✅ API error handling and edge cases
- ✅ User authentication flows
- ✅ Data synchronization accuracy

### Performance Metrics:
- **Build Time:** 27 seconds
- **Bundle Size:** ~500 KB
- **First Load:** < 2 seconds
- **API Response:** 300-800ms average

---

## 13. DEPLOYMENT

**Platform:** Vercel  
**Deployment Type:** Continuous Deployment from GitHub  
**Build Command:** `npm run build`  

**Environment Variables:**
- SUPABASE_URL
- SUPABASE_SERVICE_KEY
- CLIST_API_TOKEN
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY

---

## 14. RESULTS & IMPACT

### Achievements:
✅ Successfully aggregates data from 3 major platforms  
✅ Provides unified progress tracking  
✅ Enables performance comparison  
✅ Shows upcoming contests in one place  
✅ Maintains streak tracking and motivation  
✅ Fully functional production deployment  

### User Benefits:
- **Time Saved:** No need to check multiple platforms
- **Better Insights:** Visual analytics reveal patterns
- **Competitive Edge:** Compare with peers
- **Never Miss Contests:** All contests in one view
- **Track Progress:** Historical data and trends

---

## 15. FUTURE ENHANCEMENTS

### Planned Features:
1. **Social Integration**
   - Friend connections
   - Leaderboards
   - Activity feed

2. **Advanced Analytics**
   - ML-based problem recommendations
   - Skill gap analysis
   - Performance predictions

3. **More Platforms**
   - HackerRank
   - AtCoder
   - TopCoder

4. **Notifications**
   - Contest reminders
   - Streak alerts
   - Achievement badges

5. **Mobile App**
   - React Native version
   - Push notifications

---

## 16. LEARNING OUTCOMES

### Technical Skills Gained:
- Full-stack web development with React and Node.js
- API integration and data normalization
- State management with React Hooks and Zustand
- Serverless architecture with Vercel
- Database design and management with Supabase
- Modern UI/UX with Tailwind CSS and Framer Motion
- Deployment and DevOps practices

### Soft Skills:
- Problem-solving and debugging
- Project planning and execution
- Time management
- Technical documentation

---

## 17. CONCLUSION

CodeOrbit successfully addresses the challenges faced by competitive programmers by providing a unified platform for progress tracking, analytics, and comparison. The application demonstrates proficiency in modern web technologies, API integration, and user-centric design.

**Key Accomplishments:**
- Built a production-ready full-stack application
- Integrated multiple external APIs
- Implemented complex data visualization
- Deployed on modern cloud infrastructure
- Created comprehensive documentation

The project showcases the ability to design, develop, and deploy a complete web application that solves real-world problems for the competitive programming community.

---

## 18. REFERENCES

- **Repository:** https://github.com/Sameer6305/CodeOrbit
- **React Documentation:** https://react.dev
- **Vite:** https://vitejs.dev
- **Supabase:** https://supabase.com/docs
- **LeetCode API:** https://leetcode.com/graphql
- **Codeforces API:** https://codeforces.com/apiHelp
- **Clist API:** https://clist.by/api/v4/doc/

---

**Project Status:** ✅ Completed & Deployed  
**Last Updated:** November 28, 2025  
**Version:** 1.2.0
