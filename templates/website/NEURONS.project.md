# NEURONS.md - Website Project Map

## Purpose

Maps the structure of a website project. Provides navigation guide for developers and agents working on the codebase.

## Project Structure

```text
project-root/
├── src/                    # Source code
│   ├── components/         # Reusable UI components
│   │   ├── Header.jsx      # Site header with navigation
│   │   ├── Footer.jsx      # Site footer
│   │   ├── Hero.jsx        # Hero section component
│   │   ├── ServiceCard.jsx # Service/feature cards
│   │   ├── ContactForm.jsx # Contact form with validation
│   │   └── Button.jsx      # CTA button component
│   ├── pages/              # Page components or routes
│   │   ├── index.jsx       # Homepage
│   │   ├── about.jsx       # About page
│   │   ├── services.jsx    # Services page
│   │   └── contact.jsx     # Contact page
│   ├── styles/             # Global and component styles
│   │   ├── globals.css     # Global CSS (typography, spacing)
│   │   ├── variables.css   # CSS variables (colors, fonts)
│   │   └── components/     # Component-specific styles
│   ├── lib/                # Utility functions
│   │   ├── api.js          # API client functions
│   │   ├── validation.js   # Form validation helpers
│   │   └── analytics.js    # Analytics tracking
│   └── content/            # Page content and copy
│       ├── homepage.json   # Homepage content
│       ├── services.json   # Services content
│       └── testimonials.json # Testimonials data
├── public/                 # Static assets
│   ├── images/             # Images (logos, photos)
│   ├── fonts/              # Custom fonts (if not using CDN)
│   ├── favicon.ico         # Favicon
│   └── robots.txt          # SEO crawler instructions
├── docs/                   # Project documentation
│   ├── sitemap.md          # Navigation structure
│   ├── sections.md         # Page section composition
│   ├── seo-checklist.md    # SEO implementation checklist
│   └── analytics-setup.md  # Analytics tracking guide
├── tests/                  # Test files
│   ├── components/         # Component tests
│   └── e2e/                # End-to-end tests
├── .env.example            # Environment variables template
├── package.json            # Dependencies and scripts
├── AGENTS.md               # Operational guide (this project)
├── NEURONS.md              # Structure map (this file)
├── THOUGHTS.md             # Project vision and goals
├── VALIDATION_CRITERIA.md  # Acceptance criteria
└── workers/IMPLEMENTATION_PLAN.md  # Task backlog
```

## Key Files

| File | Purpose | When to Update |
|------|---------|----------------|
| `AGENTS.md` | Operational guide for developers | When workflow changes |
| `NEURONS.md` | Project structure map | When adding new directories |
| `THOUGHTS.md` | Vision, goals, success criteria | During discovery/planning |
| `VALIDATION_CRITERIA.md` | Quality gates and testing | Before each build phase |
| `workers/IMPLEMENTATION_PLAN.md` | Task backlog | Every planning session |
| `docs/sitemap.md` | Navigation structure | When adding/removing pages |
| `docs/sections.md` | Page section composition | During content planning |

## Component Inventory

### Layout Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `Header` | `src/components/Header.jsx` | Site header with logo and navigation |
| `Footer` | `src/components/Footer.jsx` | Site footer with links and contact info |
| `Layout` | `src/components/Layout.jsx` | Page wrapper (Header + children + Footer) |

### Content Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `Hero` | `src/components/Hero.jsx` | Hero section with headline, subhead, CTA |
| `ServiceCard` | `src/components/ServiceCard.jsx` | Service/feature card with icon, title, description |
| `Testimonial` | `src/components/Testimonial.jsx` | Testimonial card with quote, author, photo |
| `FAQ` | `src/components/FAQ.jsx` | Accordion FAQ section |
| `ContactForm` | `src/components/ContactForm.jsx` | Contact form with validation |

### UI Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `Button` | `src/components/Button.jsx` | CTA button with variants (primary, secondary) |
| `Card` | `src/components/Card.jsx` | Generic card container |
| `Section` | `src/components/Section.jsx` | Page section wrapper with consistent spacing |

## Page Inventory

| Page | Route | Component | Purpose |
|------|-------|-----------|---------|
| Home | `/` | `src/pages/index.jsx` | Landing page with hero, services, social proof |
| About | `/about` | `src/pages/about.jsx` | Story, credentials, approach |
| Services | `/services` | `src/pages/services.jsx` | Service details, pricing, process |
| Contact | `/contact` | `src/pages/contact.jsx` | Contact form, details, map |
| 404 | `/404` | `src/pages/404.jsx` | Error page with helpful navigation |

## Content Structure

Content is separated from code for easier updates:

```text
src/content/
├── homepage.json           # Homepage sections
│   ├── hero                # Hero section content
│   ├── services            # Services section
│   ├── social_proof        # Testimonials
│   └── cta                 # Final CTA
├── services.json           # Services page content
└── testimonials.json       # Testimonials data
```

## Styling System

```text
src/styles/
├── globals.css             # Base styles (reset, typography, spacing)
├── variables.css           # CSS custom properties
│   ├── --color-primary     # Brand primary color
│   ├── --color-secondary   # Brand secondary color
│   ├── --font-heading      # Heading font family
│   ├── --font-body         # Body font family
│   ├── --spacing-unit      # Base spacing (usually 8px)
│   └── --breakpoint-*      # Responsive breakpoints
└── components/             # Component-specific styles
    ├── Header.module.css
    ├── Hero.module.css
    └── ContactForm.module.css
```

## Navigation Tips

**Finding components:**

```bash
# List all components
ls src/components/

# Find component by name
find src -name "*Hero*"

# Search for component usage
rg "import.*Hero" src/
```

**Finding content:**

```bash
# View content structure
cat src/content/homepage.json

# Search content by keyword
rg "testimonial" src/content/
```

**Finding styles:**

```bash
# List all style files
find src/styles -name "*.css"

# Find CSS variable definitions
rg "--color-primary" src/styles/
```

## Development Commands

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint

# Run tests
npm run test

# Format code
npm run format
```

## File Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Components | PascalCase.jsx | `Hero.jsx`, `ContactForm.jsx` |
| Pages | kebab-case.jsx | `index.jsx`, `about.jsx` |
| Styles | match component | `Hero.module.css` |
| Utils | camelCase.js | `validation.js`, `analytics.js` |
| Content | kebab-case.json | `homepage.json`, `services.json` |

## Related

- **[AGENTS.project.md](AGENTS.project.md)** - How to work on this project
- **[docs/sitemap.md](docs/sitemap.md)** - Navigation structure
- **[docs/sections.md](docs/sections.md)** - Page section composition
- **brain/skills/domains/websites/** - Website development patterns
