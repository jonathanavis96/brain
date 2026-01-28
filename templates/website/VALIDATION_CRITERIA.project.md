# VALIDATION_CRITERIA.md - Website Project Quality Gates

## Purpose

Defines acceptance criteria and validation commands for website project. Use this to verify each phase is complete before moving forward.

## Quick Validation

```bash
# Run all checks
npm run validate

# Expected: All checks pass
```

## Phase-Specific Criteria

### Discovery Phase

**Acceptance Criteria:**

- [ ] `docs/sitemap.md` exists with 4-7 navigation items
- [ ] `docs/sections.md` exists with section order for all pages
- [ ] Target audience documented in `THOUGHTS.md`
- [ ] Primary conversion goal defined in `THOUGHTS.md`
- [ ] Value proposition (headline + subheadline) written

**Validation:**

```bash
# Check required files exist
test -f docs/sitemap.md && echo "✓ sitemap.md exists"
test -f docs/sections.md && echo "✓ sections.md exists"

# Verify THOUGHTS.md has required sections
rg -q "Target Audience" THOUGHTS.md && echo "✓ Audience defined"
rg -q "Business Goals" THOUGHTS.md && echo "✓ Goals defined"
```

### Planning Phase

**Acceptance Criteria:**

- [ ] `workers/IMPLEMENTATION_PLAN.md` exists with phased tasks
- [ ] Tech stack decision documented in `THOUGHTS.md`
- [ ] All pages have section composition in `docs/sections.md`
- [ ] Content sources identified (existing vs to-be-created)
- [ ] Dependencies installed (`node_modules/` exists)

**Validation:**

```bash
# Check planning files
test -f workers/IMPLEMENTATION_PLAN.md && echo "✓ Implementation plan exists"
test -d node_modules && echo "✓ Dependencies installed"

# Verify sections defined for all pages
rg "^## (Home|About|Services|Contact)" docs/sections.md | wc -l
# Expected: 4 (one for each main page)
```

### Design Phase

**Acceptance Criteria:**

- [ ] Color palette defined in `src/styles/variables.css`
- [ ] Typography scale defined (3-5 sizes)
- [ ] Spacing system established (base unit + multiples)
- [ ] Component styles created for core components
- [ ] Design system documented

**Validation:**

```bash
# Check design tokens exist
rg "color-primary" src/styles/variables.css && echo "✓ Colors defined"
rg "font-heading" src/styles/variables.css && echo "✓ Typography defined"
rg "spacing-unit" src/styles/variables.css && echo "✓ Spacing defined"

# Check core component styles exist
ls src/styles/components/*.css | wc -l
# Expected: 5+ component stylesheets
```

### Build Phase

**Acceptance Criteria:**

- [ ] All pages render without errors
- [ ] Navigation works (internal links functional)
- [ ] Contact form validates and submits
- [ ] Mobile responsive (test 3 breakpoints: 375px, 768px, 1200px)
- [ ] Images optimized (<200KB each)
- [ ] All images have alt text
- [ ] SEO meta tags present on all pages
- [ ] Analytics tracking installed

**Validation:**

```bash
# Build succeeds without errors
npm run build
# Expected: exit code 0

# Check image optimization
find public/images -type f -size +200k
# Expected: no output (all images <200KB)

# Check alt text coverage
rg '<img' src/ | rg -v 'alt=' && echo "✗ Images missing alt text" || echo "✓ All images have alt text"

# Check meta tags
rg '<meta name="description"' src/pages/*.jsx | wc -l
# Expected: matches number of pages
```

### QA Phase

**Acceptance Criteria:**

- [ ] Lighthouse scores: 90+ in all categories
- [ ] Color contrast meets WCAG AA (4.5:1 for text)
- [ ] Keyboard navigation works (tab through all interactive elements)
- [ ] Forms have validation and error messages
- [ ] 404 page exists
- [ ] All links work (no broken links)
- [ ] Cross-browser tested (Chrome, Firefox, Safari)
- [ ] Mobile tested on real devices

**Validation:**

```bash
# Run Lighthouse audit
npx lighthouse http://localhost:3000 --output json --output-path ./lighthouse-report.json
cat lighthouse-report.json | jq '.categories.performance.score, .categories.accessibility.score, .categories["best-practices"].score, .categories.seo.score'
# Expected: all scores > 0.90

# Check for broken links (requires site running)
npx broken-link-checker http://localhost:3000
# Expected: 0 broken links

# Verify 404 page exists
test -f src/pages/404.jsx && echo "✓ 404 page exists"
```

### Launch Phase

**Acceptance Criteria:**

- [ ] SSL certificate installed (HTTPS working)
- [ ] Custom domain configured
- [ ] robots.txt and sitemap.xml present
- [ ] Analytics verified (test event tracking)
- [ ] Forms submit to production endpoint
- [ ] Privacy policy page (if collecting data)
- [ ] Favicon and social share images added
- [ ] All test/placeholder content removed
- [ ] Performance monitoring configured

**Validation:**

```bash
# Check production deployment
curl -I https://yourdomain.com | head -1
# Expected: HTTP/2 200

# Verify SSL
curl -I https://yourdomain.com | rg "strict-transport-security"
# Expected: HSTS header present

# Check SEO files
curl -s https://yourdomain.com/robots.txt | head -5
curl -s https://yourdomain.com/sitemap.xml | head -5
# Expected: valid content

# Verify analytics (manual test)
# 1. Visit site in browser
# 2. Check browser network tab for analytics requests
# 3. Verify events appear in analytics dashboard
```

## Code Quality Gates

### Linting

```bash
# Run linter
npm run lint

# Expected: 0 errors, 0 warnings
```

### Formatting

```bash
# Check code formatting
npm run format:check

# Auto-fix formatting issues
npm run format
```

### Tests (if applicable)

```bash
# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e

# Expected: All tests pass
```

## Accessibility Checklist

Manual checks (automated tools catch ~40% of issues):

- [ ] All interactive elements keyboard accessible
- [ ] Focus indicators visible on all interactive elements
- [ ] Forms have labels (not just placeholders)
- [ ] Error messages are announced to screen readers
- [ ] Color is not the only means of conveying information
- [ ] Text can be zoomed to 200% without breaking layout
- [ ] Headings follow logical hierarchy (no skipped levels)
- [ ] Images of text are avoided (use real text)

## Performance Checklist

- [ ] Critical CSS inlined (first paint <1.5s)
- [ ] Images lazy loaded (below fold)
- [ ] Fonts optimized (WOFF2, font-display: swap)
- [ ] JavaScript code-split (< 200KB initial bundle)
- [ ] Static assets cached (1 year cache headers)
- [ ] CDN configured (if using)

## SEO Checklist

- [ ] Title tags unique per page (50-60 chars)
- [ ] Meta descriptions per page (150-160 chars)
- [ ] Heading hierarchy (H1 → H2 → H3, no skips)
- [ ] Internal linking between pages
- [ ] sitemap.xml submitted to Google Search Console
- [ ] robots.txt allows crawling
- [ ] Structured data added (JSON-LD)
- [ ] Open Graph tags (social sharing)

## Browser Support

**Target browsers:**

- Chrome/Edge (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Mobile Safari (iOS 14+)
- Chrome Mobile (Android 10+)

**Testing:**

```bash
# Use BrowserStack or similar for cross-browser testing
# Manual test checklist:
# - Layout renders correctly
# - Navigation works
# - Forms submit
# - Animations perform smoothly
```

## Common Failure Modes

| Issue | Check | Fix |
|-------|-------|-----|
| Slow page load | Bundle size, image sizes | Code-split, optimize images |
| Mobile layout broken | Responsive breakpoints | Fix CSS media queries |
| Form not submitting | Network tab, console errors | Check action URL, CORS |
| Images not loading | Path, file existence | Verify public/ paths |
| Lighthouse fails | Specific category | Address flagged issues |

## Pre-Launch Checklist

Final checks before going live:

- [ ] All content reviewed and approved
- [ ] All links tested and working
- [ ] Forms tested end-to-end (submission → email)
- [ ] Analytics tracking verified
- [ ] 404 page tested
- [ ] SSL certificate verified
- [ ] DNS records configured
- [ ] Backup strategy in place
- [ ] Rollback plan documented

## Related

- **[AGENTS.project.md](AGENTS.project.md)** - Workflow and patterns
- **[THOUGHTS.project.md](THOUGHTS.project.md)** - Success criteria and goals
- **brain/skills/domains/websites/qa/** - QA skills and patterns
- **brain/skills/domains/infrastructure/deployment-patterns.md** - Deployment guidance
