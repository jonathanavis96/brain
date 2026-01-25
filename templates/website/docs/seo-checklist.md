# SEO Implementation Checklist

## Purpose

Practical checklist for implementing SEO basics on your website. Focus on foundational elements that drive 80% of results.

## On-Page SEO

### Title Tags

**Rules:**

- Unique per page
- 50-60 characters max
- Include primary keyword
- Front-load important words
- Include brand name at end

**Examples:**

```html
<!-- Good -->
<title>Individual Therapy for Anxiety | Dr. Jane Smith</title>
<title>Web Design Services for Small Business | ACME Design</title>

<!-- Bad -->
<title>Home</title>
<title>Welcome to our website - The best services you'll ever find...</title>
```

**Implementation:**

```jsx
// Next.js example
<Head>
  <title>Individual Therapy for Anxiety | Dr. Jane Smith</title>
</Head>

// HTML
<title>Individual Therapy for Anxiety | Dr. Jane Smith</title>
```

### Meta Descriptions

**Rules:**

- Unique per page
- 150-160 characters max
- Include call-to-action
- Write for humans (click-through), not bots

**Examples:**

```html
<!-- Good -->
<meta name="description" content="Compassionate therapy for anxiety and depression in Cape Town. 15+ years experience. Book your free consultation today.">

<!-- Bad -->
<meta name="description" content="therapy, anxiety, depression, cape town, psychologist, mental health">
```

**Implementation:**

```jsx
// Next.js
<Head>
  <meta name="description" content="Compassionate therapy for anxiety and depression in Cape Town. 15+ years experience. Book your free consultation today." />
</Head>

// HTML
<meta name="description" content="...">
```

### Heading Hierarchy

**Rules:**

- One H1 per page (page title)
- Use H2 for main sections
- Use H3 for subsections
- Never skip levels (H1 → H3)
- Include keywords naturally

**Example:**

```html
<h1>Individual Therapy Services</h1>

<h2>What is Individual Therapy?</h2>
<p>...</p>

<h2>Who Benefits from Therapy?</h2>
<p>...</p>

<h3>Anxiety Management</h3>
<p>...</p>

<h3>Depression Support</h3>
<p>...</p>

<h2>How to Get Started</h2>
<p>...</p>
```

### URL Structure

**Rules:**

- Use hyphens (not underscores)
- Keep short and descriptive
- Include keywords
- Use lowercase
- Avoid parameters when possible

**Examples:**

```text
✓ /services/individual-therapy
✓ /about
✓ /blog/managing-anxiety

✗ /services.php?id=123
✗ /page_2
✗ /Services/Individual_Therapy
```

### Internal Linking

**Rules:**

- Link related pages together
- Use descriptive anchor text
- Every page should be 3 clicks from home
- Include breadcrumbs (if site is deep)

**Example:**

```html
<!-- Good -->
<p>Learn more about our <a href="/services/couples-therapy">couples therapy approach</a>.</p>

<!-- Bad -->
<p>Learn more <a href="/services/couples-therapy">here</a>.</p>
```

## Technical SEO

### robots.txt

**Purpose:** Tell search engines what to crawl

**Location:** `/public/robots.txt`

**Example:**

```text
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

Sitemap: https://yourdomain.com/sitemap.xml
```

### sitemap.xml

**Purpose:** Help search engines discover pages

**Location:** `/public/sitemap.xml`

**Example:**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://yourdomain.com/</loc>
    <lastmod>2026-01-25</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://yourdomain.com/about</loc>
    <lastmod>2026-01-20</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://yourdomain.com/services</loc>
    <lastmod>2026-01-20</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

**Auto-generation (Next.js):**

```bash
npm install next-sitemap
```

### Structured Data (JSON-LD)

**Purpose:** Help search engines understand content

**Types:**

- LocalBusiness (local service providers)
- Organization (companies)
- Person (professionals)
- Article (blog posts)

**Example: LocalBusiness**

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Dr. Jane Smith Psychology",
  "image": "https://yourdomain.com/logo.jpg",
  "description": "Compassionate therapy for anxiety and depression in Cape Town",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "123 Main Street",
    "addressLocality": "Cape Town",
    "addressRegion": "Western Cape",
    "postalCode": "8001",
    "addressCountry": "ZA"
  },
  "telephone": "+27123456789",
  "email": "contact@yourdomain.com",
  "url": "https://yourdomain.com",
  "priceRange": "$$",
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "09:00",
      "closes": "17:00"
    }
  ]
}
</script>
```

**Example: Organization**

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "ACME Web Design",
  "url": "https://yourdomain.com",
  "logo": "https://yourdomain.com/logo.png",
  "sameAs": [
    "https://www.linkedin.com/company/acme",
    "https://twitter.com/acme"
  ]
}
</script>
```

### Open Graph (Social Sharing)

**Purpose:** Control how page looks when shared on social media

**Required tags:**

```html
<meta property="og:title" content="Individual Therapy Services | Dr. Jane Smith">
<meta property="og:description" content="Compassionate therapy for anxiety and depression in Cape Town. Book your free consultation today.">
<meta property="og:image" content="https://yourdomain.com/social-share.jpg">
<meta property="og:url" content="https://yourdomain.com/services/individual-therapy">
<meta property="og:type" content="website">
```

**Twitter Cards:**

```html
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Individual Therapy Services | Dr. Jane Smith">
<meta name="twitter:description" content="Compassionate therapy for anxiety and depression in Cape Town.">
<meta name="twitter:image" content="https://yourdomain.com/social-share.jpg">
```

**Image requirements:**

- 1200x630px (optimal)
- Max 5MB
- JPG or PNG
- Includes branding/text overlay

## Performance (SEO Impact)

### Core Web Vitals

**Metrics:**

- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

**Check:**

```bash
npx lighthouse https://yourdomain.com --view
```

### Image Optimization

**Rules:**

- Use WebP format (with JPG fallback)
- Lazy load below-fold images
- Serve responsive images
- Compress (aim for < 200KB per image)

**Implementation:**

```html
<!-- Next.js Image component -->
<Image 
  src="/hero.jpg" 
  alt="Therapy session" 
  width={1200} 
  height={800}
  loading="lazy"
/>

<!-- HTML with responsive images -->
<img 
  src="/hero-800w.jpg"
  srcset="/hero-400w.jpg 400w, /hero-800w.jpg 800w, /hero-1200w.jpg 1200w"
  sizes="(max-width: 600px) 400px, (max-width: 1200px) 800px, 1200px"
  alt="Therapy session"
  loading="lazy"
>
```

## Content SEO

### Keyword Research

**Tools:**

- Google Search Console (free)
- Google Keyword Planner (free)
- AnswerThePublic (free)
- Ubersuggest (freemium)

**Process:**

1. Brainstorm seed keywords (e.g., "therapy cape town")
2. Use tools to find variations and questions
3. Prioritize by search volume + relevance + difficulty
4. Target 1 primary keyword per page
5. Include 2-3 related keywords naturally

### Content Length

**Guidelines:**

- Homepage: 500-800 words
- Service pages: 800-1200 words
- About page: 400-600 words
- Blog posts: 1200-2000 words

**Quality over quantity:** Don't pad content. Write for humans first.

### Alt Text for Images

**Rules:**

- Describe image content (for accessibility)
- Include keywords naturally (when relevant)
- Keep under 125 characters
- Skip "image of" or "picture of"

**Examples:**

```html
<!-- Good -->
<img src="therapy-room.jpg" alt="Comfortable therapy room with couch and natural light">
<img src="jane-smith.jpg" alt="Dr. Jane Smith, clinical psychologist">

<!-- Bad -->
<img src="therapy-room.jpg" alt="image">
<img src="jane-smith.jpg" alt="therapy anxiety depression cape town psychologist">
```

## Local SEO (Service Businesses)

### Google Business Profile

**Setup:**

1. Claim listing at google.com/business
2. Verify business (postcard or phone)
3. Complete all fields (hours, services, photos)
4. Get reviews (minimum 5)
5. Post updates monthly

### NAP Consistency

**NAP = Name, Address, Phone**

**Rule:** Must be identical everywhere:

- Website footer
- Contact page
- Google Business Profile
- Social media profiles
- Directory listings

**Example:**

```text
✓ Dr. Jane Smith Psychology
  123 Main Street, Cape Town, 8001
  +27 12 345 6789

✗ Jane Smith (no title)
  123 Main St (abbreviated)
  27123456789 (no formatting)
```

### Local Citations

**Directories to list in (South Africa example):**

- Google Business Profile
- Yelp
- Facebook
- LinkedIn
- Industry-specific (e.g., Psychology Today for therapists)

## Launch Checklist

Before going live:

- [ ] Title tags and meta descriptions on all pages
- [ ] H1 on every page
- [ ] Alt text on all images
- [ ] robots.txt configured
- [ ] sitemap.xml generated and submitted
- [ ] Google Search Console verified
- [ ] Google Analytics installed
- [ ] Structured data added (LocalBusiness or Organization)
- [ ] Open Graph tags on key pages
- [ ] SSL certificate installed (HTTPS)
- [ ] Mobile-friendly (Google Mobile-Friendly Test)
- [ ] Page speed < 3s (Lighthouse)
- [ ] 404 page exists

## Monitoring

### Google Search Console

**Setup:** <https://search.google.com/search-console>

**Monitor:**

- Index coverage (are pages indexed?)
- Performance (impressions, clicks, CTR)
- Core Web Vitals
- Mobile usability

**Review:** Monthly

### Google Analytics

**Setup:** <https://analytics.google.com>

**Track:**

- Organic traffic
- Top landing pages
- Bounce rate
- Conversions

**Review:** Weekly

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Missing title tags | Add unique title to every page |
| Duplicate meta descriptions | Write unique description per page |
| No alt text | Add descriptive alt text to all images |
| Slow page speed | Optimize images, minimize JS/CSS |
| Not mobile-friendly | Use responsive design, test on real devices |
| No sitemap | Generate and submit sitemap.xml |
| Broken links | Run link checker, fix 404s |
| Thin content | Add substantive content (800+ words for key pages) |

## Related

- **[analytics-setup.md](analytics-setup.md)** - Analytics tracking guide
- **brain/skills/domains/marketing/seo/seo-audit.md** - Comprehensive SEO audit
- **brain/skills/domains/marketing/seo/programmatic-seo.md** - Advanced SEO tactics
- **brain/skills/domains/marketing/seo/schema-markup.md** - Structured data patterns
