# 🎯 Quick Start Guide - Benchmark Feature

## 📍 Navigation

### Finding the Benchmark Page
The **Benchmark** option is now in your sidebar between Analytics and Contests:

```
📂 Sidebar Menu:
├── 📊 Dashboard
├── 📈 Analytics  
├── 👥 Benchmark  ← NEW!
├── 🏆 Contests
└── ⚙️ Settings
```

---

## 🚀 Using the Benchmark Feature

### Step 1: Enter Profile Handles
On the Benchmark page, you'll see three input fields:

```
┌─────────────────────────────────────────────────────┐
│  🔵 Codeforces Handle                              │
│  [tourist_____________________________]            │
│                                                     │
│  🟡 LeetCode Username                              │
│  [example_user________________________]            │
│                                                     │
│  🟤 CodeChef Handle                                │
│  [competitive_coder___________________]            │
│                                                     │
│  [🏆 Compare Performance]                          │
└─────────────────────────────────────────────────────┘
```

**Note**: You only need to fill at least ONE field to compare!

---

### Step 2: View Comparison Results

After clicking "Compare Performance", you'll see:

#### 📊 Overall Comparison Cards
```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│    YOU      │  │ COMPARISON  │  │  OPPONENT   │
│  🏆 Winner  │  │     +150    │  │             │
│             │  │ You're ahead│  │             │
│ Total: 2500 │  │             │  │ Total: 2350 │
│ 🟡 LC: 1800 │  │             │  │ 🟡 LC: 1500 │
│ 🔵 CF:  500 │  │             │  │ 🔵 CF:  600 │
│ 🟤 CC:  200 │  │             │  │ 🟤 CC:  250 │
└─────────────┘  └─────────────┘  └─────────────┘
```

---

#### 📈 Visual Charts

**1. Radar Chart - Platform Performance**
```
         LeetCode
            /\
           /  \
          /    \
    CF  ●------● CC
         \    /
          \  /
           \/
    
    Legend:
    Blue Line  = You
    Pink Line  = Opponent
```

**2. Bar Chart - Current Streaks**
```
Days
 50 ┤        ███
 40 ┤    ███ ███
 30 ┤    ███ ███
 20 ┤ ███ ███ ███ ███
 10 ┤ ███ ███ ███ ███
  0 └─────────────────
     LC  CF  CC
     
    Blue = You
    Pink = Opponent
```

---

#### 🏆 Platform Leaders
```
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│ 🟡 LeetCode   │  │ 🔵 Codeforces │  │ 🟤 CodeChef   │
│               │  │               │  │               │
│  1800 vs 1500 │  │  500 vs 600   │  │  200 vs 250   │
│               │  │               │  │               │
│ 🏆 You lead!  │  │ 💪 They lead! │  │ 💪 They lead! │
└───────────────┘  └───────────────┘  └───────────────┘
```

---

## 📊 Enhanced Analytics Page

### New Stats Overview (4 Cards)
```
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Total Probs  │ │ Active Days  │ │ Current      │ │ Longest      │
│              │ │              │ │ Streak       │ │ Streak       │
│    2,500     │ │     245      │ │     45       │ │     67       │
│              │ │              │ │              │ │              │
│ 🟡 1800      │ │ Days with    │ │ Combined     │ │ Personal     │
│ 🔵  500      │ │ activity     │ │ platforms    │ │ best         │
│ 🟤  200      │ │              │ │              │ │              │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
```

---

### Charts Section

#### 1️⃣ Last 7 Days Activity (Stacked Bar Chart)
```
Problems
  30 ┤     ███████
  25 ┤     ███████
  20 ┤ ███ ███████ ███
  15 ┤ ███ ███████ ███ ███
  10 ┤ ███ ███████ ███ ███
   5 ┤ ███ ███████ ███ ███ ███
   0 └─────────────────────────────
     Mon Tue Wed Thu Fri Sat Sun

Colors:
█ Yellow  = LeetCode
█ Blue    = Codeforces  
█ Orange  = CodeChef
```

#### 2️⃣ Problem Difficulty Distribution (Pie Chart)
```
        Hard (15%)
           🔴
    Medium │
     (40%) │ Easy
      🟠   │ (45%)
           🟢
           
┌────────┐ ┌────────┐ ┌────────┐
│  1,125 │ │ 1,000  │ │  375   │
│  🟢Easy│ │🟠Medium│ │ 🔴Hard │
└────────┘ └────────┘ └────────┘
```

---

## 🎨 Visual Indicators

### Winner Highlighting
- **Green Background + Border** = You're winning
- **Blue Background + Border** = Opponent is winning
- **Gray Background** = Tied
- **🏆 Trophy Icon** = Leader in category

### Platform Colors
- 🟡 **LeetCode** - Yellow/Orange (#eab308)
- 🔵 **Codeforces** - Blue (#3b82f6)
- 🟤 **CodeChef** - Orange/Brown (#f97316)

### Difficulty Colors
- 🟢 **Easy** - Green (#10b981)
- 🟠 **Medium** - Orange (#f59e0b)
- 🔴 **Hard** - Red (#ef4444)

---

## 💡 Pro Tips

### 1. Multiple Comparisons
- You can compare with different users by entering new handles
- Previous results are replaced with new comparison
- No limit on how many comparisons you can do

### 2. Partial Comparisons
- Don't have a CodeChef account? Just enter CF and LC handles
- The comparison works with any combination of platforms
- Missing platforms show as 0 in the results

### 3. Reading the Charts
- **Radar Chart**: Bigger area = better performance
- **Bar Chart**: Taller bar = longer streak
- **Platform Leaders**: Trophy = you win that platform

### 4. Analytics Insights
- Use the 7-day chart to spot activity patterns
- Pie chart shows if you're avoiding hard problems
- Compare streaks to see consistency trends

---

## 🔍 Example Comparison Flow

### Scenario: Compare with "tourist" on Codeforces

```
1. Navigate to Benchmark page
   └─> Click "Benchmark" in sidebar

2. Enter handle
   └─> Codeforces Handle: "tourist"
   └─> Leave others blank (optional)

3. Click Compare
   └─> Loading spinner appears
   └─> Results load in 2-5 seconds

4. Analyze Results
   └─> See you have 500 CF problems
   └─> Tourist has ~3,500 CF problems
   └─> They lead by 3,000 problems
   └─> Radar chart shows huge gap
   └─> Trophy goes to tourist

5. Get Motivated!
   └─> Set goals based on gap
   └─> Track progress over time
   └─> Try again next month
```

---

## ⚡ Keyboard Shortcuts

- **Enter** in any input field → Triggers comparison
- **Ctrl + K** → Focus first input field (browser default)
- **Tab** → Navigate between input fields

---

## 📱 Mobile Experience

### Portrait Mode:
- Cards stack vertically
- Charts resize to fit screen
- Input fields full width
- Sidebar becomes overlay menu

### Landscape Mode:
- Two-column grid layout
- Charts side-by-side
- Better chart visibility

---

## 🎯 Common Use Cases

### 1. Track Friend's Progress
```
Compare → Enter friend's handles → See who's ahead → Compete!
```

### 2. Set Personal Goals
```
Compare with top coder → See the gap → Set milestone goals
```

### 3. Platform Strength Analysis
```
Compare → Check platform leaders → Focus on weak platforms
```

### 4. Motivation Boost
```
Winning comparison? Keep going! Losing? Time to grind!
```

---

## 🚫 Troubleshooting

### "At least one profile required"
- Enter at least one handle before comparing

### "Failed to fetch comparison data"
- Check if handle exists on that platform
- Try again (might be temporary API issue)
- Verify spelling of username

### Charts not showing
- Make sure you've synced your data first
- Check if you have activity in last 7 days
- Try refreshing the page

### Dark mode issues
- Charts are fully dark mode compatible
- Clear browser cache if colors look wrong

---

## 🎉 That's It!

You're now ready to:
✅ Compare with any coder worldwide  
✅ Analyze your performance trends  
✅ Set data-driven improvement goals  
✅ Track your coding journey visually  

**Happy Coding & Competing! 🚀**

---

*Need help? Check the main README or open an issue on GitHub*
