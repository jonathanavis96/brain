# PC Quanti - Repository Structure Map

**Project Type:** Next.js website  
**Location:** `/home/grafe/code/pc_quanti`  
**Tech Stack:** Next.js 14, React, TypeScript, Tailwind CSS

---

## Quick Navigation

| I need to... | Go here |
|--------------|---------|
| Add a new page | `src/app/[page-name]/page.tsx` |
| Update site metadata | `src/app/layout.tsx` |
| Modify global styles | `src/app/globals.css` |
| Add components | `src/components/` |
| Update Tailwind config | `tailwind.config.ts` |
| Change logo/assets | `public/` |
| See active tasks | `brain/workers/IMPLEMENTATION_PLAN.md` |
| Understand project vision | `brain/workers/ralph/THOUGHTS.md` |

---

## Directory Structure

```
pc_quanti/
├── public/                    # Static assets
│   ├── logo.png              # PC Quanti logo (bright blue house)
│   ├── favicon.ico
│   └── images/               # Stock photos, icons, etc.
│
├── src/
│   ├── app/                  # Next.js 14 App Router
│   │   ├── layout.tsx        # Root layout (header, footer, metadata)
│   │   ├── page.tsx          # Home page
│   │   ├── about/
│   │   │   └── page.tsx      # About page
│   │   ├── services/
│   │   │   ├── page.tsx      # Services overview
│   │   │   ├── project-management/
│   │   │   ├── quantity-surveying/
│   │   │   ├── contract-administration/
│   │   │   ├── claims-management/
│   │   │   └── project-controls/
│   │   ├── sectors/          # Optional sector pages
│   │   │   ├── nuclear/
│   │   │   ├── mining/
│   │   │   ├── infrastructure/
│   │   │   └── energy/
│   │   ├── contact/
│   │   │   └── page.tsx      # Contact form
│   │   └── api/              # API routes (form submissions, etc.)
│   │       └── contact/
│   │           └── route.ts  # Contact form handler
│   │
│   ├── components/           # Reusable React components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Hero.tsx
│   │   ├── ServiceCard.tsx
│   │   ├── ContactForm.tsx
│   │   └── Button.tsx
│   │
│   ├── lib/                  # Utility functions
│   │   ├── api.ts            # API helpers
│   │   └── validation.ts     # Form validation
│   │
│   └── styles/
│       └── globals.css       # Global Tailwind imports
│
├── brain/                    # Ralph/Cortex infrastructure
│   ├── workers/
│   │   ├── IMPLEMENTATION_PLAN.md  # Task list
│   │   └── ralph/
│   │       ├── THOUGHTS.md   # Vision & goals
│   │       ├── NEURONS.md    # This file
│   │       ├── PROMPT.md     # Ralph's instructions
│   │       ├── loop.sh       # Ralph execution loop
│   │       └── THUNK.md      # Completion log
│   ├── cortex/
│   │   └── cortex-pc.bash    # Cortex manager wrapper
│   └── skills/               # Brain knowledge snapshot
│
├── tailwind.config.ts        # Tailwind configuration
├── next.config.js            # Next.js configuration
├── tsconfig.json             # TypeScript configuration
├── package.json              # Dependencies
├── .gitignore
└── README.md

```

---

## File Locations Cheat Sheet

### Pages
- **Home:** `src/app/page.tsx`
- **About:** `src/app/about/page.tsx`
- **Services:** `src/app/services/page.tsx` (+ individual service sub-pages)
- **Contact:** `src/app/contact/page.tsx`

### Components
- **Header/Nav:** `src/components/Header.tsx`
- **Footer:** `src/components/Footer.tsx`
- **Hero section:** `src/components/Hero.tsx`
- **Contact form:** `src/components/ContactForm.tsx`

### Styling
- **Tailwind config:** `tailwind.config.ts` (define brand colors here)
- **Global CSS:** `src/app/globals.css`
- **Typography:** Configured in `tailwind.config.ts` (recommend: Inter or Manrope)

### Assets
- **Logo:** `public/logo.png`
- **Favicon:** `public/favicon.ico`
- **Images:** `public/images/`

### Configuration
- **Site metadata:** `src/app/layout.tsx` (title, description, OG tags)
- **Environment variables:** `.env.local` (API keys, form endpoints, etc.)
- **Next.js config:** `next.config.js` (image optimization, redirects, etc.)

---

## Tech Stack Details

### Next.js 14 (App Router)
- **Server Components by default** (faster initial load, better SEO)
- **File-based routing:** Each folder in `src/app/` becomes a route
- **API routes:** `src/app/api/` for serverless functions (e.g., contact form handler)
- **Metadata API:** SEO tags defined in `layout.tsx` or page-level `metadata` exports

### Tailwind CSS
- **Utility-first CSS:** Style components with class names (e.g., `bg-blue-600 text-white px-4 py-2`)
- **Custom config:** Define brand colors (#2C02D9), fonts, spacing in `tailwind.config.ts`
- **Responsive:** Mobile-first breakpoints (`sm:`, `md:`, `lg:`, `xl:`)

### TypeScript
- **Type safety:** Catch errors at compile time
- **Component props:** Define interfaces for all component props
- **API responses:** Type API data for better autocomplete and safety

---

## Development Commands

```bash
# Install dependencies
npm install

# Run dev server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Run production build locally
npm run start

# Lint code
npm run lint

# Type check
npx tsc --noEmit
```

---

## Common Tasks

### Add a new page
1. Create folder in `src/app/` (e.g., `src/app/new-page/`)
2. Add `page.tsx` inside
3. Export default React component
4. Update navigation in `src/components/Header.tsx`

### Update brand colors
1. Edit `tailwind.config.ts`
2. Add custom color: `colors: { 'pc-blue': '#2C02D9' }`
3. Use in components: `className="bg-pc-blue text-white"`

### Add a component
1. Create file in `src/components/` (e.g., `ServiceCard.tsx`)
2. Define TypeScript interface for props
3. Export default component
4. Import and use in page: `import ServiceCard from '@/components/ServiceCard'`

### Deploy to Vercel
1. Push to GitHub: `git push origin pc-quanti-work`
2. Connect repo in Vercel dashboard
3. Configure environment variables (if any)
4. Deploy automatically on push to main

---

## Validation Commands

```bash
# Test build (no errors)
npm run build

# Check TypeScript types
npx tsc --noEmit

# Lint code
npm run lint

# Run Lighthouse audit (in Chrome DevTools)
# Or use CLI:
npx lighthouse http://localhost:3000 --view
```

---

## SEO Checklist

- [ ] Metadata in `src/app/layout.tsx` (title, description)
- [ ] OG tags for social sharing
- [ ] Sitemap.xml generated (Next.js plugin or manual)
- [ ] Robots.txt in `public/`
- [ ] Structured data (Schema.org) for Organization, Services
- [ ] Image alt tags on all images
- [ ] Semantic HTML (`<header>`, `<main>`, `<footer>`, `<nav>`)
- [ ] Internal linking (services pages link to each other)

---

## Brain Infrastructure

### Ralph (Worker)
- **Location:** `brain/workers/ralph/`
- **Run:** `cd brain/workers/ralph && bash loop.sh --iterations 10`
- **Tasks:** `brain/workers/IMPLEMENTATION_PLAN.md`
- **Completions:** `brain/workers/ralph/THUNK.md`

### Cortex (Manager)
- **Location:** `brain/cortex/`
- **Run:** `cd brain/cortex && bash cortex-pc.bash`
- **Notifications:** Branded as `cortex-pc` (e.g., "cortex-pc complete")

### Skills
- **Location:** `brain/skills/`
- **Access:** Brain knowledge snapshot (React patterns, SEO best practices, etc.)
- **Update:** `bash brain/workers/ralph/sync_brain_skills.sh` (from parent Brain repo)

---

**Last Updated:** 2026-02-14  
**Status:** Repository structure defined, ready for Phase 0 development
