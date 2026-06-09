# Dota 2 AI Coach - Project Brief

## Vision

An AI-powered Dota 2 coaching platform that analyzes gameplay, identifies mistakes, and provides personalized recommendations to help players improve faster.

## Target Users

- Dota 2 players (Herald to Divine ranks)
- Players who want to climb MMR systematically
- Self-improvement focused gamers

## Core Value

"A 10k MMR coach that learns your playstyle and gives data-driven feedback"

## MVP Scope (2-3 months)

### What's Included
- Steam OAuth login
- Post-game analysis (last 10-100 games)
- Mistake detection (deaths, farm efficiency, positioning)
- Rank-based benchmarking (set target rank)
- Progress tracking over time
- LLM-generated coaching insights
- Web dashboard (responsive)

### What's NOT Included (Future)
- Live match monitoring (paid feature)
- Overwolf integration
- Desktop/mobile apps
- Team analysis

## Tech Stack

**Backend:** Python 3.11+, FastAPI, PostgreSQL, Redis, Celery  
**Frontend:** Next.js 14+, TypeScript, Tailwind CSS, shadcn/ui  
**AI/ML:** OpenAI GPT-4 / Anthropic Claude  
**Infrastructure:** Docker, Vercel, Railway/Render  

## Success Criteria

- 100 users in first month
- Average user analyzes 20+ games
- Positive feedback on coaching quality
- Measurable improvement tracking

## Next Steps

1. Bootstrap project structure
2. Set up development environment
3. Implement Stratz API integration
4. Build core analysis algorithms
5. Create web dashboard MVP

---

See `DESIGN.md` for full technical specification.
