# AGENTS.md - Website Project Guide

## Purpose

Operational instructions for building conversion-focused websites. This template provides structure, patterns, and workflows for common website projects.

## Prerequisites

- Understanding of target audience and business goals
- Basic familiarity with chosen tech stack (HTML/CSS/JS framework)
- Access to hosting/deployment environment

## Project Structure

See [NEURONS.project.md](NEURONS.project.md) for complete project map.

**Key directories:**

- `src/` - Source code (components, styles, assets)
- `public/` - Static assets (images, fonts, favicon)
- `content/` - Page content and copy (markdown or JSON)
- `docs/` - Project documentation

## Workflow

### 1. Discovery Phase (PLAN mode)

**Read these skills first:**

- `skills/domains/websites/discovery/requirements-distiller.md`
- `skills/domains/websites/discovery/audience-mapping.md`
- `skills/domains/websites/architecture/sitemap-builder.md`

**Create these files:**

- `sitemap.md` - Navigation structure (4-7 top items)
- `sections.md` - Page section composition for each page
- `VALIDATION_CRITERIA.md` - Success metrics and acceptance criteria

**Key questions to answer:**

- Who is the primary audience?
- What is the main conversion goal? (contact form, purchase, signup)
- What pages are needed? (typically: Home, About, Services, Contact)
- What trust signals exist? (testimonials, credentials, case studies)

### 2. Planning Phase (PLAN mode)

**Read these skills:**

- `skills/domains/websites/architecture/section-composer.md`
- `skills/domains/websites/architecture/tech-stack-chooser.md`
- `skills/domains/websites/copywriting/value-proposition.md`

**Create/update:**

- `workers/IMPLEMENTATION_PLAN.md` - Phased build plan
- `sections.md` - Detailed section content for each page
- Tech stack decisions documented in `THOUGHTS.md`

**Universal page flow (use for all pages):**

1. ATTENTION → Hero (what is this, is it for me?)
2. TRUST → Social proof (can I trust this?)
3. VALUE → Services/benefits (what do I get?)
4. CLARITY → Process/how it works (what happens next?)
5. CONNECTION → About/story (who is behind this?)
6. OBJECTIONS → FAQ (what about my concerns?)
7. ACTION → CTA (what do I do now?)

### 3. Design Phase (BUILD mode)

**Read these skills:**

- `skills/domains/websites/design/design-direction.md`
- `skills/domains/websites/design/typography-system.md`
- `skills/domains/websites/design/color-system.md`
- `skills/domains/websites/design/spacing-layout.md`

**Tasks:**

- Define typography scale (3-5 sizes max)
- Choose color palette (primary, secondary, neutrals)
- Set spacing system (4px/8px base, use multiples)
- Create reusable component styles

### 4. Build Phase (BUILD mode)

**Read these skills:**

- `skills/domains/websites/copywriting/cta-optimizer.md`
- `skills/domains/websites/copywriting/objection-handler.md`

**Build in this order:**

1. **Layout structure** - Header, footer, page containers
2. **Core sections** - Hero, services, about, contact
3. **Forms** - Contact/booking forms with validation
4. **Mobile responsiveness** - Test all breakpoints
5. **Performance** - Image optimization, lazy loading
6. **SEO basics** - Meta tags, structured data, sitemap.xml

**Each component should:**

- Be mobile-first (design for smallest screen first)
- Use semantic HTML (`<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`)
- Include ARIA labels where needed
- Have clear visual hierarchy

### 5. QA Phase (BUILD mode)

**Read these skills:**

- `skills/domains/websites/qa/acceptance-criteria.md`
- `skills/domains/websites/qa/visual-qa.md`
- `skills/domains/websites/qa/accessibility.md`

**Checklist:**

- [ ] All pages load in <3 seconds
- [ ] Mobile navigation works (hamburger menu)
- [ ] Forms submit and validate correctly
- [ ] All images have alt text
- [ ] Color contrast meets WCAG AA (4.5:1 for text)
- [ ] Links have focus states
- [ ] Test on Chrome, Firefox, Safari, mobile browsers
- [ ] Run Lighthouse audit (aim for 90+ in all categories)

### 6. Launch Phase (BUILD mode)

**Read these skills:**

- `skills/domains/websites/launch/finishing-pass.md`
- `skills/domains/websites/launch/deployment.md`

**Pre-launch checklist:**

- [ ] Analytics tracking installed (GA4 or alternative)
- [ ] Favicon and social share images added
- [ ] 404 page exists and is helpful
- [ ] Privacy policy and terms pages (if collecting data)
- [ ] SSL certificate installed (HTTPS)
- [ ] robots.txt and sitemap.xml configured
- [ ] Test all forms submit to correct endpoint
- [ ] Remove test content and placeholder text

## Common Patterns

### Navigation Structure (4-7 items max)

```html
<!-- Simple service site -->
<nav>
  <a href="/">Home</a>
  <a href="/about">About</a>
  <a href="/services">Services</a>
  <a href="/contact">Contact</a>
  <a href="/book" class="cta-button">Book Now</a>
</nav>
```

### Hero Section Template

```html
<section class="hero">
  <h1>Clear Value Proposition (8-12 words)</h1>
  <p class="subheadline">Who it's for and what they get (15-25 words)</p>
  <a href="#contact" class="cta-button">Primary CTA (2-4 words)</a>
  <p class="trust-line">Social proof snippet (e.g., "Trusted by 500+ clients")</p>
</section>
```

### Contact Form

```html
<form action="/api/contact" method="post">
  <label for="name">Name *</label>
  <input type="text" id="name" name="name" required>
  
  <label for="email">Email *</label>
  <input type="email" id="email" name="email" required>
  
  <label for="message">Message *</label>
  <textarea id="message" name="message" rows="5" required></textarea>
  
  <button type="submit">Send Message</button>
</form>
```

## Tech Stack Recommendations

| Stack | Best For | Notes |
|-------|----------|-------|
| **HTML/CSS/JS** | Simple 5-page sites | No build step, easy hosting |
| **Next.js** | SEO-critical, content-heavy | SSG/SSR, great DX |
| **Astro** | Marketing sites, blogs | Fast, content-focused |
| **SvelteKit** | Interactive sites | Small bundle, fast |
| **WordPress** | Non-technical client handoff | Easy CMS, large ecosystem |

## Validation

Before marking phase complete:

```bash
# Run linters
npm run lint

# Build production
npm run build

# Test locally
npm run preview

# Lighthouse audit
npx lighthouse http://localhost:3000 --view
```

## Troubleshooting

| Issue | Check |
|-------|-------|
| Slow page load | Image sizes, bundle size, lazy loading |
| Mobile layout broken | Breakpoints, overflow-x, font sizes |
| Form not submitting | Action URL, CORS, validation errors |
| SEO issues | Meta tags, semantic HTML, sitemap |
| Accessibility fails | Color contrast, alt text, keyboard nav |

## See Also

- **[THOUGHTS.project.md](THOUGHTS.project.md)** - Project vision and goals
- **[NEURONS.project.md](NEURONS.project.md)** - Project structure map
- **[VALIDATION_CRITERIA.project.md](VALIDATION_CRITERIA.project.md)** - Acceptance criteria
- **[sitemap.md](docs/sitemap.md)** - Navigation structure
- **[sections.md](docs/sections.md)** - Page section composition
- **skills/domains/websites/** - All website skills
- **skills/domains/marketing/** - Marketing and CRO skills
