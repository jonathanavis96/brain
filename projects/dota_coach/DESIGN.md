# Dota 2 AI Coach - Technical Design Document

## Overview

An AI-powered Dota 2 coaching system that analyzes gameplay, identifies mistakes, tracks progress, and provides actionable recommendations to improve player performance.

### Core Value Proposition

**"A 10k MMR coach that learns your playstyle and gives personalized, data-driven feedback"**

---

## System Goals

1. **Mistake Detection** - Identify high-impact errors (deaths, farm efficiency, positioning)
2. **Priority Scoring** - Focus on biggest wins (frequency × impact × fixability)
3. **Progress Tracking** - Measure improvement over time with rank-based benchmarks
4. **Personalized Coaching** - Adapt to player's current rank and target rank
5. **Opportunity Cost Analysis** - Show what you COULD have gained vs what you lost

---

## Key Features

### 1. Rank-Based Benchmarking

Players set:
- **Current Rank:** e.g., Legend 1
- **Target Rank:** e.g., Ancient 3

All metrics are compared against **target rank averages**:
- CS/min benchmarks for Ancient 3 players
- Death timing patterns for Ancient 3 players
- Item timing goals for Ancient 3 players
- Map positioning heatmaps for Ancient 3 players

### 2. Opportunity Cost Analysis

Instead of just "you died and lost 300 gold":

```text
⚠️ Death at 7:32 in enemy jungle
   Lost: 300 gold + 60s respawn time
   Opportunity cost: Could have farmed 4 creep waves (700g)
   Net impact: -1,000 gold swing
   
💡 Recommendation: Ward their jungle before farming deep, or stick to safer farm
```

### 3. Smart Historical Analysis

**NOT pulling all 8,692 games by default!**

Configurable time windows:
- Last 10 games (quick trends)
- Last 24 hours (session performance)
- Last week (recent improvement)
- Last month (stable patterns)
- Last 100 games (statistical significance)
- Custom date range

Rate limit friendly - only fetch what's needed.

### 4. Web-First Platform

**MVP:** Web dashboard only
- Post-game analysis
- Progress tracking
- Historical reviews
- Coaching recommendations

**Future (Paid Tiers):**
- Overwolf integration (in-game overlay)
- Desktop standalone app
- Mobile companion app

---

## Technical Architecture

### Technology Stack

```yaml
Backend:
  - Python 3.11+ (FastAPI)
  - PostgreSQL (player data, matches, progress)
  - Redis (caching, rate limiting)
  - Celery (background jobs)
  
Frontend:
  - Next.js 14+ (TypeScript)
  - Tailwind CSS
  - Chart.js / Recharts (visualizations)
  - shadcn/ui (components)
  
AI/ML:
  - OpenAI GPT-4 / Anthropic Claude (coaching insights)
  - scikit-learn (pattern detection)
  - pandas (data analysis)
  
Infrastructure:
  - Docker + docker-compose (local dev)
  - Vercel (frontend hosting)
  - Railway/Render (backend hosting)
  - GitHub Actions (CI/CD)
```

### Data Flow

```text
1. Match Complete
   ↓
2. Webhook/Polling detects new match
   ↓
3. Fetch match details from Stratz API
   ↓
4. Store in PostgreSQL (raw + processed)
   ↓
5. Run analysis pipeline:
   - Death analysis
   - Farm efficiency
   - Position heatmaps
   - Pattern detection
   ↓
6. Generate coaching insights (LLM)
   ↓
7. Update player progress metrics
   ↓
8. Notify user (web dashboard)
```

---

## Database Schema

```sql
-- Players
CREATE TABLE players (
    steam_id BIGINT PRIMARY KEY,
    current_rank VARCHAR(50),
    target_rank VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Matches (raw data from Stratz)
CREATE TABLE matches (
    match_id BIGINT PRIMARY KEY,
    steam_id BIGINT REFERENCES players(steam_id),
    hero_id INT,
    position INT,  -- 1-5
    result VARCHAR(10),  -- 'win' or 'loss'
    duration INT,  -- seconds
    kills INT,
    deaths INT,
    assists INT,
    last_hits INT,
    denies INT,
    gpm INT,
    xpm INT,
    raw_data JSONB,  -- Full Stratz response
    analyzed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Death Events
CREATE TABLE death_events (
    id SERIAL PRIMARY KEY,
    match_id BIGINT REFERENCES matches(match_id),
    timestamp INT,  -- game time in seconds
    position_x INT,
    position_y INT,
    networth_lost INT,
    opportunity_cost INT,  -- calculated gold loss
    phase VARCHAR(20),  -- 'early', 'mid', 'late'
    created_at TIMESTAMP DEFAULT NOW()
);

-- Mistakes (detected patterns)
CREATE TABLE mistakes (
    id SERIAL PRIMARY KEY,
    match_id BIGINT REFERENCES matches(match_id),
    category VARCHAR(50),  -- 'death', 'farm', 'positioning', 'itemization'
    severity INT,  -- 1-10
    impact_score FLOAT,  -- calculated impact on game
    description TEXT,
    recommendation TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Progress Tracking
CREATE TABLE progress_metrics (
    id SERIAL PRIMARY KEY,
    steam_id BIGINT REFERENCES players(steam_id),
    metric_name VARCHAR(100),  -- 'avg_deaths_per_game', 'cs_at_10min', etc.
    value FLOAT,
    time_window VARCHAR(20),  -- 'last_10', 'last_week', etc.
    calculated_at TIMESTAMP DEFAULT NOW()
);

-- Rank Benchmarks (seeded data)
CREATE TABLE rank_benchmarks (
    rank VARCHAR(50),
    metric_name VARCHAR(100),
    avg_value FLOAT,
    percentile_25 FLOAT,
    percentile_50 FLOAT,
    percentile_75 FLOAT,
    PRIMARY KEY (rank, metric_name)
);
```

---

## Development Phases

### Phase 1: MVP - Post-Game Analysis (Months 1-2)

**Goal:** Working web dashboard with post-game analysis

#### Features:
- [ ] User authentication (Steam OAuth)
- [ ] Fetch recent matches from Stratz API
- [ ] Store match data in PostgreSQL
- [ ] Basic death analysis:
  - Death timestamps
  - Death positions (heatmap)
  - Opportunity cost calculation
- [ ] Farm efficiency tracking:
  - CS at 10/20/30 min
  - GPM comparison vs target rank
- [ ] Simple coaching insights (LLM-generated)
- [ ] Web dashboard showing:
  - Last 10 games summary
  - Top 3 mistakes per game
  - Progress chart (deaths over time)

#### Success Criteria:
- User can log in and see their last 10 games
- System identifies top 3 mistakes per game
- Recommendations are actionable and specific

#### API Usage Estimate:
- Post-game fetch: 1 call per game
- Player profile: 1 call per session
- **~50-100 calls/day for active user** (well within 10k limit)

---

### Phase 2: Progress Tracking & Patterns (Month 3)

**Goal:** Multi-game analysis and progress tracking

#### Features:
- [ ] Configurable time windows (last 10/50/100 games, last week/month)
- [ ] Pattern detection across multiple games:
  - Win rate correlation with early deaths
  - Hero-specific performance
  - Position-specific benchmarks
- [ ] Progress dashboards:
  - Metric trends over time
  - Improvement percentage
  - Rank prediction (based on stats)
- [ ] Goal setting:
  - Set target rank
  - Track progress towards rank goals
- [ ] Comparative analysis:
  - Your stats vs target rank average
  - Percentile ranking

#### Success Criteria:
- User can see improvement trends over 30 days
- System shows "you're playing like a [rank] player"
- Clear progress indicators towards target rank

---

### Phase 3: Live Match Monitoring (Future - Paid Feature)

**Goal:** Real-time coaching during games

**Note:** NOT included in MVP due to:
- Higher API usage costs
- Complex polling infrastructure
- Need for Overwolf integration or desktop app

#### Future Implementation Plan:
- Poll Stratz `live.match(id)` every 30-60 seconds
- Detect patterns in real-time:
  - All enemies missing → smoke alert
  - 2+ deaths in 10 min → lane swap suggestion
  - Farm behind target → focus farm reminder
- Deliver via:
  - Overwolf overlay
  - Desktop app notifications
  - Mobile push notifications

#### API Usage:
- Polling every 60s for 40-min game = 40 calls/game
- With rate limits: Max 5 concurrent users on default token
- **Requires Individual Token (4k calls/hour)**

---

## Mistake Detection Algorithms

### Categories

1. **Early Deaths (0-10 min)**
   - Impact: Lane lost, level disadvantage
   - Severity: High (8-10/10)
   - Detection: `if death_time < 600 and phase == 'laning'`

2. **Farm Efficiency**
   - Impact: Gold/XP disadvantage
   - Severity: Medium-High (6-8/10)
   - Detection: `if cs_at_10min < target_rank_avg * 0.8`

3. **Positioning Errors**
   - Impact: Deaths in same location repeatedly
   - Severity: Medium (5-7/10)
   - Detection: Cluster deaths within 500 units

4. **Item Timing**
   - Impact: Power spike delays
   - Severity: Medium (5-7/10)
   - Detection: `if item_time > target_rank_avg * 1.2`

### Priority Scoring Formula

```python
def calculate_priority(mistake):
    frequency = count_similar_mistakes_last_10_games(mistake)
    impact = mistake.impact_score  # 1-10
    fixability = 10 - mistake.complexity  # easier = higher score
    
    priority = (frequency * 0.4) + (impact * 0.4) + (fixability * 0.2)
    return priority
```

### Example Output

```json
{
  "match_id": 8012345678,
  "mistakes": [
    {
      "priority": 8.5,
      "category": "early_death",
      "description": "Died at 7:32 in enemy jungle without vision",
      "impact": {
        "gold_lost": 300,
        "opportunity_cost": 700,
        "net_impact": -1000,
        "respawn_time": 60
      },
      "recommendation": "Ward enemy jungle before farming deep, or rotate to safer farm zones",
      "frequency_last_10": 6,
      "fixability": 8
    },
    {
      "priority": 7.2,
      "category": "farm_efficiency",
      "description": "CS at 10min: 42 (target: 65 for Ancient 3)",
      "impact": {
        "gold_behind": 1150,
        "percentage": "64% of target rank average"
      },
      "recommendation": "Practice last-hitting in demo mode. Focus on securing ranged creep (focus fire with denies)",
      "frequency_last_10": 8,
      "fixability": 9
    }
  ]
}
```

---

## LLM Integration (Coaching Insights)

### Prompt Template

```text
You are a 10k MMR Dota 2 coach analyzing a player's performance.

Player Profile:
- Current Rank: {current_rank}
- Target Rank: {target_rank}
- Hero: {hero_name}
- Position: {position}

Match Data:
- Result: {win/loss}
- KDA: {kills}/{deaths}/{assists}
- Duration: {duration} minutes
- CS: {last_hits} ({cs_per_min}/min)
- GPM/XPM: {gpm}/{xpm}

Detected Mistakes:
{mistakes_json}

Target Rank Benchmarks (Ancient 3):
- CS at 10min: 65
- Avg deaths/game: 4.2
- Avg GPM: 550

Generate:
1. Top 3 actionable recommendations
2. Opportunity cost analysis for biggest mistake
3. One specific drill/practice to improve fastest

Be specific, encouraging, and focus on high-impact improvements.
```

---

## API Rate Limit Management

### Default Token Limits
- 20 calls/second
- 250 calls/minute
- 2,000 calls/hour
- 10,000 calls/day

### Usage Strategy

```python
# Efficient data fetching
def fetch_recent_matches(steam_id, count=10):
    """
    Fetch last N matches (configurable)
    NOT all 8,692 games!
    """
    # Single API call gets last 10 matches
    # 1 call per game for detailed stats
    # Total: 11 calls
    pass

def fetch_time_window(steam_id, days=7):
    """
    Fetch matches from last N days
    Estimate: ~5-10 games/day for active player
    """
    # 1 call for match IDs
    # 35-70 calls for detailed stats (7 days)
    pass

# Caching strategy
CACHE_TTL = {
    "player_profile": 3600,  # 1 hour
    "match_details": 86400,  # 24 hours (won't change)
    "rank_benchmarks": 604800,  # 1 week
}
```

### Multi-User Scaling

- Default token: ~100 active users/day
- Individual token: ~500 active users/day
- Backend caching reduces duplicate calls

---

## Rank Benchmarking Data

### Required Research

Scrape/aggregate data from:
1. **OpenDota API** - Public match statistics
2. **Stratz public stats** - Rank distribution data
3. **Dotabuff** - Hero/rank correlations
4. **Pro player replays** - High MMR benchmarks
5. **Community guides** - Item timing standards

### Benchmark Categories

```python
BENCHMARKS = {
    "herald": {
        "cs_at_10min": 30,
        "avg_deaths": 8.5,
        "avg_gpm": 350,
        # ... more metrics
    },
    "guardian": { ... },
    "crusader": { ... },
    "archon": { ... },
    "legend": { ... },
    "ancient": {
        "cs_at_10min": 65,
        "avg_deaths": 4.2,
        "avg_gpm": 550,
        "first_item_timing": {
            "battlefury": 900,  # 15 min
            "bkb": 1200,  # 20 min
        }
    },
    "divine": { ... },
    "immortal": { ... },
}
```

### Hero-Specific Adjustments

Some heroes have different benchmarks:
- **AM/Naga**: Higher CS expectations
- **Support (pos 5)**: Lower CS, higher assist ratio
- **Offlane**: Tankiness > farm

```python
def get_benchmark(rank, hero, metric):
    base = BENCHMARKS[rank][metric]
    hero_modifier = HERO_MODIFIERS[hero].get(metric, 1.0)
    return base * hero_modifier
```

---

## MVP Development Roadmap

### Month 1: Core Infrastructure

**Week 1:**
- [x] Project setup (Next.js + FastAPI)
- [x] Database schema + migrations
- [x] Steam OAuth integration
- [x] Stratz API wrapper

**Week 2:**
- [ ] Match fetching logic
- [ ] Basic data storage
- [ ] Simple web UI (list matches)

**Week 3:**
- [ ] Death analysis algorithm
- [ ] Farm efficiency calculator
- [ ] Mistake detection v1

**Week 4:**
- [ ] LLM integration (coaching insights)
- [ ] Basic dashboard UI
- [ ] Testing with real data

### Month 2: Polish & Launch

**Week 5:**
- [ ] Progress tracking UI
- [ ] Chart/graph components
- [ ] Responsive design

**Week 6:**
- [ ] Rank benchmark data collection
- [ ] Target rank comparison feature
- [ ] Opportunity cost calculations

**Week 7:**
- [ ] Beta testing with 10 users
- [ ] Bug fixes
- [ ] Performance optimization

**Week 8:**
- [ ] Public launch
- [ ] Marketing (Reddit r/learndota2, r/TrueDoTA2)
- [ ] Collect user feedback

---

## Monetization Strategy (Future)

### Free Tier
- Last 10 games analysis
- Basic progress tracking
- 3 coaching insights per week

### Premium ($9.99/month)
- Unlimited game analysis
- Full progress tracking (all-time)
- Advanced pattern detection
- LLM coaching insights (unlimited)
- Custom time windows

### Pro Tier ($19.99/month)
- Everything in Premium
- Live match monitoring (future)
- Overwolf integration (future)
- Desktop app (future)
- Priority support
- Custom coaching reports

---

## Success Metrics

### MVP (Month 2)
- [ ] 100 registered users
- [ ] 50 active users (using weekly)
- [ ] 1,000 matches analyzed
- [ ] Positive feedback from beta testers

### 6 Months
- [ ] 1,000 registered users
- [ ] 10% conversion to paid
- [ ] Average user analyzes 20+ games
- [ ] Measurable rank improvement (case studies)

### 1 Year
- [ ] 10,000 users
- [ ] $5k MRR
- [ ] Overwolf integration live
- [ ] Partnership with Dota 2 community sites

---

## Technical Challenges & Solutions

### Challenge 1: Rate Limits
**Solution:** Aggressive caching, smart time windows, upgrade to Individual Token

### Challenge 2: Data Volume
**Solution:** Don't pull all games, configurable windows, archive old data

### Challenge 3: LLM Costs
**Solution:** Cache common insights, use smaller models for simple analysis, rate limit free tier

### Challenge 4: Real-time Accuracy
**Solution:** MVP is post-game only, live monitoring is paid feature with proper infrastructure

### Challenge 5: Rank Benchmarks
**Solution:** Scrape public APIs, crowd-source from users, update quarterly

---

## Next Steps

1. **Bootstrap Project** - Use Brain templates to create repo structure
2. **Set up Dev Environment** - Docker compose with PostgreSQL + Redis
3. **Stratz API Testing** - Validate all required endpoints work
4. **Database Setup** - Run migrations, seed rank benchmarks
5. **Build Match Fetcher** - Core backend logic
6. **Simple UI** - Login + match list
7. **First Analysis Algorithm** - Death detection
8. **Iterate!**

---

## References

- [Stratz API Docs](https://docs.stratz.com/)
- [OpenDota API](https://docs.opendota.com/)
- [Dota 2 Wiki](https://dota2.fandom.com/)
- [Learn Dota 2 Subreddit](https://reddit.com/r/learndota2)
- [Dota 2 ProTracker](https://www.dota2protracker.com/)

---

**Last Updated:** 2026-02-18  
**Version:** 1.0 (MVP Design)
