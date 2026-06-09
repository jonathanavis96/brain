# Partners Online Gallery — SEO & Website Audit: Developer Implementation Guide

**Prepared by:** [All Done Sites](https://alldonesites.com) — *Your website, done for you — for one monthly fee*
**Site:** https://partnersonlinegallery.com/
**Audit Date:** 2026-03-15
**Platform:** Shopify (Dawn theme v15.4.0)
**Audience:** Developers / Web Partner

> This document accompanies the client-facing report (`partnersonlinegallery_seo_client_report.html`) prepared by All Done Sites for David Vermeulen. It contains the full technical implementation specification for all recommendations in that report.

---

## Table of Contents

1. [Current State Summary](#1-current-state-summary)
2. [Title Tags](#2-title-tags)
3. [Meta Descriptions](#3-meta-descriptions)
4. [Heading Structure (H1–H4)](#4-heading-structure-h1h4)
5. [Image Alt Text](#5-image-alt-text)
6. [Schema Markup (JSON-LD)](#6-schema-markup-json-ld)
7. [Open Graph & Social Tags](#7-open-graph--social-tags)
8. [Sitemap & Page Architecture](#8-sitemap--page-architecture)
9. [Performance & Image Optimisation](#9-performance--image-optimisation)
10. [Accessibility](#10-accessibility)
11. [Analytics & Tracking](#11-analytics--tracking)
12. [Priority Checklist](#12-priority-checklist)

---

## 1. Current State Summary

### What's Working Well

| Area | Status | Notes |
|------|--------|-------|
| Platform | ✅ Good | Shopify Dawn theme (modern, fast, well-maintained) |
| Product Schema | ✅ Good | JSON-LD Product markup present on product pages with price, availability, SKU |
| Organisation Schema | ✅ Good | Basic Organisation + WebSite schema on all pages |
| SSL | ✅ Good | HTTPS enforced site-wide |
| Navigation | ✅ Good | Clear category structure (by genre + artist) |
| Product Descriptions | ✅ Good | Rich, detailed copy on product pages (250+ words) |
| Sitemap | ✅ Good | Auto-generated Shopify sitemap with 228 products, pages, collections |
| robots.txt | ✅ Good | Standard Shopify robots.txt, well-configured |
| Analytics | ✅ Good | GA4 (G-D6GTYLCXKX) + Facebook Pixel active |
| Primary Image Alt Text | ✅ Good | Product images have descriptive alt text with dimensions and scene descriptions |
| Filtering | ✅ Good | Collection pages have filter by availability, price, medium, artist |
| Contact Info | ✅ Good | WhatsApp, phone, email clearly displayed in footer |

### Critical Issues

| Area | Status | Impact |
|------|--------|--------|
| Meta Descriptions | ❌ Missing | 0/all pages — Google writes its own snippets |
| Multiple H1 Tags | ❌ Broken | Homepage and About page have 2× H1 tags each |
| Secondary Image Alt Text | ⚠️ Partial | Icon images, founder photos, banner images missing alt text |
| Open Graph Tags | ❌ Missing | No og:title, og:image, og:description for social sharing |
| Blog/Content Marketing | ❌ Absent | No blog content exists (404 on /blogs) |
| Canonical Tags | ⚠️ Unclear | Not explicitly visible in page source (Shopify usually handles this) |

---

## 2. Title Tags

Shopify handles title tags via **Online Store > Preferences** (homepage) and **Edit Page/Product > SEO Preview** section.

### Homepage (`https://partnersonlinegallery.com/`)

```html
<!-- CURRENT (inferred) -->
<title>Partners Online Gallery</title>

<!-- REPLACE WITH -->
<title>Partners Online Gallery | South African Art for Sale | Cape Town</title>
```

**Character count:** 64 (within 60–70 char limit ✅)

---

### About Page (`/pages/about-us`)

```html
<!-- CURRENT -->
<title>About Us – Partners Online Gallery</title>

<!-- REPLACE WITH -->
<title>About the Curators | Partners Online Gallery | Cape Town Art</title>
```

**Character count:** 62 ✅

---

### Contact Page (`/pages/contact`)

```html
<!-- CURRENT -->
<title>Contact – Partners Online Gallery</title>

<!-- REPLACE WITH -->
<title>Contact Us | Buy South African Art Online | Partners Online Gallery</title>
```

**Character count:** 68 ✅

---

### Collections Page (`/collections`)

```html
<!-- CURRENT -->
<title>Collections – Partners Online Gallery</title>

<!-- REPLACE WITH -->
<title>Browse Original South African Art & Prints | Partners Online Gallery</title>
```

**Character count:** 70 ✅

---

### All Artwork (`/collections/all-artwork`)

```html
<!-- CURRENT -->
<title>All Artwork – Partners Online Gallery</title>

<!-- REPLACE WITH -->
<title>Original South African Art for Sale | Paintings & Prints | Partners Gallery</title>
```

**Character count:** 78 (slightly over — trim if needed to 70)

---

### Artist Pages (template for all 13)

```html
<!-- PATTERN: CURRENT -->
<title>[Artist Name] – Partners Online Gallery</title>

<!-- PATTERN: REPLACE WITH -->
<title>[Artist Name] | South African Artist | Partners Online Gallery</title>
```

**Apply to:** Allison Pilling, Charles Amos, Dante Ruben, Daria Baluta, Darren McKay, Dawie Fourie, James Yates, Karin Hopkinson, Kristi Marie, Mike Forrester, Phyllida Louw, Sannette Boshoff, Sue Paulsen

---

## 3. Meta Descriptions

Add via **Shopify Admin > Pages/Products > Edit > SEO Preview > Meta Description**.

### Homepage

```html
<!-- ADD THIS (currently missing) -->
<meta name="description" content="Discover original South African art from established and emerging artists. Oil paintings, prints &amp; mixed media shipped globally from Cape Town. Browse the collection.">
```

**Character count:** 160 ✅

---

### About Page

```html
<!-- ADD THIS (currently missing) -->
<meta name="description" content="Meet David Vermeulen and Zanne Cronjé, the Cape Town curators behind Partners Online Gallery. Hand-picked South African art from 13+ featured artists.">
```

**Character count:** 155 ✅

---

### Contact Page

```html
<!-- ADD THIS (currently missing) -->
<meta name="description" content="Get in touch with Partners Online Gallery. WhatsApp +27 67 668 1201 or email us. We ship original South African art globally from Cape Town.">
```

**Character count:** 143 ✅

---

### All Artwork Collection

```html
<!-- ADD THIS (currently missing) -->
<meta name="description" content="Browse 140+ original South African paintings and limited edition prints. Oil, acrylic &amp; mixed media from R1,500. Free delivery in South Africa.">
```

**Character count:** 148 ✅

---

### Genre Collections (template)

```html
<!-- PATTERN -->
<meta name="description" content="Original South African [genre] art for sale. Hand-picked [genre] paintings by leading SA artists. Shop online at Partners Gallery, Cape Town.">
```

**Apply to:** Landscape, Abstract, Animals, Botanical, Cityscape, Flowerscape, Seascape, Skyscape, Still Life, Portraits

---

### Artist Bio Pages (template)

```html
<!-- PATTERN -->
<meta name="description" content="[Artist Name] — South African artist featured at Partners Online Gallery. View and buy original [medium] works. [1 sentence about the artist's style].">
```

---

## 4. Heading Structure (H1–H4)

Edit in **Shopify Admin > Online Store > Pages > Edit with block editor** or via theme code.

### Homepage (`/`)

#### Critical Issue: Two H1 Tags

```html
<!-- CURRENT — TWO H1s (WRONG) -->
<h1>CURATED ONLINE ART WITH SOUL AND STORY</h1>
<h1>PARTNERS ONLINE GALLERY</h1>

<!-- REPLACE WITH — ONE H1, rest as H2 (CORRECT) -->
<h1>Curated South African Art Online — Original Paintings &amp; Prints</h1>
<h2>Partners Online Gallery</h2>
```

**Reason:** Multiple H1 tags dilute ranking signal. The H1 must contain primary keywords ("South African Art", "Original Paintings").

---

#### H2s — Section Headings

```html
<!-- CURRENT -->
<h2>RECENT PIECES</h2>
<!-- REPLACE WITH -->
<h2>Recent Original Artworks for Sale</h2>

<!-- CURRENT -->
<h2>Shop Our Art now</h2>
<!-- REPLACE WITH -->
<h2>Shop South African Art Online</h2>

<!-- CURRENT -->
<h2>Purely an online gallery – no physical space. Just art, in its truest form.</h2>
<!-- This is copy, not a heading. REPLACE WITH -->
<h2>About Partners Online Gallery</h2>
<p>Purely an online gallery – no physical space. Just art, in its truest form.</p>

<!-- CURRENT -->
<h2>SUBSCRIBE TO OUR EMAILS</h2>
<!-- OK as-is — low SEO value section -->
```

---

### About Page (`/pages/about-us`)

#### Critical Issue: Two H1 Tags

```html
<!-- CURRENT — TWO H1s (WRONG) -->
<h1>BRINGING ARTISTS AND COLLECTORS TOGETHER</h1>
<h1>ABOUT PARTNERS ONLINE GALLERY</h1>

<!-- REPLACE WITH — ONE H1 -->
<h1>About Partners Online Gallery — Connecting Collectors with South African Art</h1>
```

---

### Contact Page (`/pages/contact`)

```html
<!-- CURRENT -->
<h1>Contact Us</h1>
<!-- OK — single H1 ✅ -->

<!-- IMPROVE TO -->
<h1>Contact Partners Online Gallery — Buy Art from Cape Town</h1>
```

---

## 5. Image Alt Text

Update in **Shopify Admin > Settings > Files** (for theme assets) or **Products > Edit > Image alt text** (for products).

### Product Images (Generally Good — Maintain Standard)

Product images already have descriptive alt text. **Maintain this standard** for all new uploads:

```
Format: "[Medium] [dimensions], [description of scene/subject] by [Artist Name]"
Example: "Oil on canvas, 100 cm × 120 cm, rock formation with sunlit vertical strata in Swartberg Pass by James Yates"
```

### Theme Images (Missing — Fix These)

| Image Location | Current Alt Text | Replace With |
|----------------|-----------------|--------------|
| Homepage hero banner | *(empty)* | `South African art collection — original paintings and prints from Partners Online Gallery` |
| About page banner | *(empty)* | `Partners Online Gallery curated art collection from Cape Town` |
| David Vermeulen photo | *(empty)* | `David Vermeulen — Co-founder of Partners Online Gallery` |
| Zanne Cronjé photo | *(empty)* | `Zanne Cronjé — Co-founder of Partners Online Gallery` |
| Contact page banner | *(empty)* | `Contact Partners Online Gallery for South African art enquiries` |
| Footer image | *(empty)* | `Partners Online Gallery — South African art shipped globally` |
| Delivery icon | *(empty)* | `Global art shipping icon` |
| Payments icon | *(empty)* | `Secure payment icon` |
| Returns icon | *(empty)* | `Returns policy icon` |
| Communication icon | *(empty)* | `Customer communication icon` |

**In Shopify:** Go to **Online Store > Themes > Edit code > Sections**, find the relevant section file, and add `alt` attributes to `<img>` tags. For theme images uploaded via the customiser, edit them in **Online Store > Themes > Customize > click image > Edit alt text**.

---

## 6. Schema Markup (JSON-LD)

### Current State — What Exists

**Organisation Schema** ✅ (all pages):
```json
{
  "@type": "Organization",
  "name": "Partners Online Gallery",
  "logo": "[CDN URL]",
  "sameAs": ["Facebook", "Instagram", "Pinterest"],
  "url": "https://partnersonlinegallery.com"
}
```

**WebSite Schema** ✅ (homepage):
```json
{
  "@type": "WebSite",
  "name": "Partners Online Gallery",
  "potentialAction": {"@type": "SearchAction"},
  "url": "https://partnersonlinegallery.com"
}
```

**Product Schema** ✅ (product pages):
- Includes name, price, currency (ZAR), availability, SKU, brand, description, image

### What's Missing — Add These

#### 1. Enhanced Organisation → ArtGallery (Homepage Only)

Replace the existing Organisation schema on the homepage with this enhanced version. In Shopify, add via **Online Store > Themes > Edit code > layout/theme.liquid** before `</head>`:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["ArtGallery", "Store"],
      "@id": "https://partnersonlinegallery.com/#business",
      "name": "Partners Online Gallery",
      "alternateName": "Partners Gallery",
      "description": "Online art gallery featuring original South African paintings, limited edition prints, and mixed media works from established and emerging artists. Based in Cape Town, shipping globally.",
      "url": "https://partnersonlinegallery.com/",
      "telephone": "+27676681201",
      "email": "partnersgalleryza@gmail.com",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Cape Town",
        "addressRegion": "Western Cape",
        "addressCountry": "ZA"
      },
      "areaServed": [
        {
          "@type": "Country",
          "name": "South Africa"
        },
        {
          "@type": "Place",
          "name": "Worldwide"
        }
      ],
      "priceRange": "R1,500–R92,000",
      "currenciesAccepted": "ZAR",
      "founder": [
        {
          "@type": "Person",
          "name": "David Vermeulen"
        },
        {
          "@type": "Person",
          "name": "Zanne Cronjé"
        }
      ],
      "sameAs": [
        "https://web.facebook.com/profile.php?id=61575535576538",
        "https://www.instagram.com/partnersonlinegallery/",
        "https://www.pinterest.com/partnersgalleryza/"
      ],
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "South African Art Collection",
        "itemListElement": [
          {
            "@type": "OfferCatalog",
            "name": "Original Artwork",
            "description": "Original oil paintings, acrylics, and mixed media by South African artists"
          },
          {
            "@type": "OfferCatalog",
            "name": "Limited Edition Prints",
            "description": "Limited edition landscape and seascape prints"
          }
        ]
      }
    },
    {
      "@type": "WebSite",
      "@id": "https://partnersonlinegallery.com/#website",
      "url": "https://partnersonlinegallery.com/",
      "name": "Partners Online Gallery",
      "publisher": {
        "@id": "https://partnersonlinegallery.com/#business"
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://partnersonlinegallery.com/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    }
  ]
}
</script>
```

#### 2. Artist Schema (Artist Bio Pages)

Add to each artist bio page template. In Shopify: **Online Store > Themes > Edit code > templates/page.artist.liquid** (create a custom template):

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "[Artist Name]",
  "description": "[First 160 chars of artist bio]",
  "url": "https://partnersonlinegallery.com/pages/[artist-slug]",
  "jobTitle": "Visual Artist",
  "nationality": {
    "@type": "Country",
    "name": "South Africa"
  },
  "affiliation": {
    "@type": "ArtGallery",
    "name": "Partners Online Gallery",
    "url": "https://partnersonlinegallery.com"
  }
}
</script>
```

#### 3. BreadcrumbList (All Pages)

Add breadcrumb schema to improve SERP display. Most Shopify themes support this natively — check **Online Store > Themes > Customize > Theme settings > Breadcrumbs** or add manually:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://partnersonlinegallery.com/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "[Collection/Page Name]",
      "item": "https://partnersonlinegallery.com/[path]"
    }
  ]
}
</script>
```

**Validate at:** https://validator.schema.org/ and https://search.google.com/test/rich-results

---

## 7. Open Graph & Social Tags

These are critical for social media sharing (Facebook, Pinterest, WhatsApp). When someone shares an artwork link, these tags control the preview image and text.

### Add to theme.liquid (`<head>` section)

Check **Online Store > Themes > Edit code > layout/theme.liquid**. Shopify Dawn usually generates these, but verify they're present. If not, add:

```html
<!-- Open Graph -->
<meta property="og:site_name" content="Partners Online Gallery">
<meta property="og:type" content="{{ request.page_type | default: 'website' }}">
<meta property="og:title" content="{{ page_title }}">
<meta property="og:description" content="{{ page_description | default: 'Original South African art from established and emerging artists. Oil paintings, prints & mixed media shipped globally from Cape Town.' }}">
<meta property="og:url" content="{{ canonical_url }}">
{% if page_image %}
<meta property="og:image" content="https:{{ page_image | image_url: width: 1200 }}">
<meta property="og:image:width" content="1200">
{% endif %}

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{{ page_title }}">
<meta name="twitter:description" content="{{ page_description | default: 'Original South African art from established and emerging artists.' }}">
{% if page_image %}
<meta name="twitter:image" content="https:{{ page_image | image_url: width: 1200 }}">
{% endif %}
```

**Why this matters:** Pinterest is listed as a social channel. Art galleries get significant traffic from Pinterest — without OG tags, shared pins show broken or random images instead of the artwork.

---

## 8. Sitemap & Page Architecture

### Current State

| Content Type | Count | Status |
|-------------|-------|--------|
| Products | 228 | ✅ In sitemap |
| Collections | Multiple | ✅ In sitemap |
| Pages | Multiple | ✅ In sitemap |
| Blog posts | 0 | ❌ No blog exists |

The sitemap is auto-generated by Shopify and includes products, pages, collections, and blog sub-sitemaps. **No action needed on the sitemap itself.**

### Recommended New Pages (Content Marketing)

Create these as **Blog posts** under a new blog called "Art Journal" or "Gallery Notes":

| Content Type | Target Keywords | Priority |
|-------------|----------------|----------|
| Blog: "How to Buy Art Online in South Africa" | "buy art online south africa", "original art for sale SA" | High |
| Blog: "Guide to South African Art Styles" | "south african art styles", "SA contemporary art" | High |
| Blog: "Caring for Original Oil Paintings" | "oil painting care", "how to hang art" | Medium |
| Blog: "Meet the Artists" series (per artist) | [artist name] + "south african artist" | Medium |
| Page: FAQ | "art gallery FAQ", shipping questions | Medium |
| Blog: "Why Invest in South African Art" | "south african art investment", "art as investment" | Low |

### Blog Setup in Shopify

1. Go to **Online Store > Blog posts > Manage blogs**
2. Create blog called "Journal" (URL: `/blogs/journal`)
3. Write posts targeting the keywords above
4. Each post should be 800–1,500 words with 2–4 internal links to relevant collections/products
5. Submit updated sitemap to Google Search Console after publishing

---

## 9. Performance & Image Optimisation

### PageSpeed Insights Scores (March 2026)

| Metric | Mobile | Desktop |
|--------|--------|---------|
| **Performance** | ⚠️ **51/100** | ⚠️ **69/100** |
| **Accessibility** | ✅ **93/100** | ✅ **97/100** |
| **Best Practices** | ⚠️ **77/100** | ⚠️ **77/100** |
| **SEO** | ✅ **100/100** | ✅ **100/100** |

### Core Web Vitals (Lab Data)

| Metric | Mobile | Desktop | Target |
|--------|--------|---------|--------|
| First Contentful Paint (FCP) | ❌ **3.1s** | ✅ **0.4s** | < 1.8s |
| Largest Contentful Paint (LCP) | ❌ **10.2s** | ✅ **1.3s** | < 2.5s |
| Total Blocking Time (TBT) | ⚠️ **630ms** | ❌ **780ms** | < 200ms |
| Cumulative Layout Shift (CLS) | ✅ **0** | ✅ **0.004** | < 0.1 |
| Speed Index | ⚠️ **4.6s** | ✅ **1.3s** | < 3.4s |

**Critical finding:** Mobile LCP of 10.2s is over 4× the recommended threshold. This is the hero banner image loading slowly on mobile connections. Google uses mobile scores for ranking.

### Diagnostics & Opportunities

| Issue | Impact |
|-------|--------|
| Reduce unused JavaScript | Est savings 273 KiB |
| Improve image delivery | Est savings 55–173 KiB |
| Use efficient cache lifetimes | Est savings 122 KiB |
| Legacy JavaScript | Est savings 32 KiB |
| Minimize main-thread work | 2.5–2.9s |
| Long main-thread tasks | 8–10 tasks found |
| Non-composited animations | 7 animated elements |
| Uses deprecated APIs | 1 warning |
| Browser console errors | Present |

### Image Loading

Shopify's Dawn theme handles lazy loading and responsive images automatically via `srcset`. However, for an art gallery with high-resolution images, verify:

**Check these settings in Shopify:**

1. **Online Store > Themes > Customize > Theme settings > Media**
   - Ensure "Lazy load images" is ON
   - Ensure responsive images are enabled

2. **Product image upload guidelines:**
   - Upload at max 4472 × 4472 px (Shopify's limit)
   - Use JPEG for photographs/paintings (not PNG)
   - Shopify auto-converts to WebP for supported browsers
   - Target file size: under 500KB per image after Shopify processing

3. **Hero/banner images:**
   - These are the largest LCP candidates
   - Ensure homepage hero is optimised: max 400KB, use `fetchpriority="high"` in theme code
   - In `sections/image-banner.liquid`, add to the main image tag:

```html
loading="eager" fetchpriority="high"
```

### Font Loading

The site loads two custom fonts (Lora + Gilda Display) from Shopify CDN. These are render-blocking.

**Fix:** In `layout/theme.liquid`, add font preloading:

```html
<link rel="preload" href="[Lora font CDN URL]" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="[Gilda Display font CDN URL]" as="font" type="font/woff2" crossorigin>
```

### Third-Party Scripts

**Current load:** GA4, Facebook Pixel, Shopify Analytics, hCaptcha, PayFast

These are all necessary. No bloat detected. ✅

---

## 10. Accessibility

### Issues to Fix

| Issue | Location | Fix |
|-------|----------|-----|
| Missing alt text on icons | Homepage service section | Add descriptive alt text (see Section 5) |
| Missing alt text on banners | About, Contact pages | Add descriptive alt text (see Section 5) |
| Skip-to-content link | Site-wide | Dawn theme should include this — verify in theme settings |
| Form labels | Contact page | Ensure all form fields have `<label>` elements or `aria-label` attributes |
| Newsletter form | Footer | Add `aria-label="Email address"` to the email input |
| Colour contrast | Site-wide | Test with browser DevTools — ensure text meets WCAG 2.1 AA (4.5:1 ratio) |

### Shopify Accessibility Settings

Go to **Online Store > Themes > Customize > Theme settings > Accessibility** and verify:
- Focus styles are enabled
- Skip to content link is visible on focus
- Colour contrast meets AA standard

---

## 11. Analytics & Tracking

### Current Setup ✅

| Tool | ID | Status |
|------|-----|--------|
| Google Analytics 4 | G-D6GTYLCXKX | ✅ Active |
| Facebook Pixel | 31424149977233514 | ✅ Active |
| Shopify Analytics | Built-in | ✅ Active |

### Missing — Set Up These

| Tool | Action | Priority |
|------|--------|----------|
| Google Search Console | Verify domain, submit sitemap | **High** |
| Google Business Profile | Create listing (even for online-only, use Cape Town) | **High** |
| Pinterest Business | Convert to business account, claim website | **Medium** |
| Google Merchant Center | List products for Google Shopping | **Medium** |

### Google Search Console Setup

1. Go to https://search.google.com/search-console
2. Add property: `https://partnersonlinegallery.com`
3. Verify via DNS TXT record (Shopify: **Settings > Domains > DNS**)
4. Submit sitemap: `https://partnersonlinegallery.com/sitemap.xml`

---

## 12. Priority Checklist

### Phase 1 — Quick Wins (< 2 hours total)

- [ ] Add meta description to homepage (Shopify > Online Store > Preferences)
- [ ] Add meta description to About page
- [ ] Add meta description to Contact page
- [ ] Add meta description to All Artwork collection
- [ ] Fix double H1 on homepage → one H1, one H2
- [ ] Fix double H1 on About page → one H1
- [ ] Update homepage `<title>` tag to include "South African Art"
- [ ] Update Contact page `<title>` tag
- [ ] Set up Google Search Console + submit sitemap

### Phase 2 — Content & Structure (3–5 hours)

- [ ] Add meta descriptions to all 13 artist bio pages
- [ ] Add meta descriptions to all genre collection pages
- [ ] Update all genre collection title tags
- [ ] Add alt text to all theme/banner images (10 images)
- [ ] Add alt text to founder photos on About page
- [ ] Update homepage H2 headings with keywords
- [ ] Add Open Graph + Twitter Card meta tags to theme.liquid
- [ ] Insert enhanced ArtGallery JSON-LD schema on homepage
- [ ] Add Breadcrumb schema to theme
- [ ] Set up Google Business Profile

### Phase 3 — Growth (Ongoing)

- [ ] Create "Journal" blog with first 3 posts
- [ ] Add Person schema to artist bio pages
- [ ] Set up Pinterest Business account + claim website
- [ ] Explore Google Merchant Center for product listings
- [ ] Create FAQ page
- [ ] Add artist interview / studio visit blog content
- [ ] Optimise hero banner image loading (fetchpriority="high")
- [ ] Preload custom fonts

---

*Prepared by [All Done Sites](https://alldonesites.com) for David Vermeulen — partnersonlinegallery.com — March 2026*

*All Done Sites provides hassle-free website subscriptions for small businesses: design, hosting, maintenance, and updates for one monthly fee. For questions about this audit or ongoing SEO maintenance, contact us at alldonesites.com.*
