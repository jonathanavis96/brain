# Good Vibrationz — SEO Audit: Developer Implementation Guide

**Prepared by:** [All Done Sites](https://alldonesites.com) — *Your website, done for you — for one monthly fee*
**Site:** https://goodvibrationz.co.za/
**Audit Date:** 2026-03-12
**Platform:** WordPress
**Audience:** Developers / Web Partner

> This document accompanies the client-facing report (`goodvibrationz_seo_client_report.html`) prepared by All Done Sites for DJ Mat Pheiffer. It contains the full technical implementation specification for all recommendations in that report.

---

## Table of Contents

1. [Prerequisites & Plugins](#1-prerequisites--plugins)
2. [Title Tags](#2-title-tags)
3. [Meta Descriptions](#3-meta-descriptions)
4. [Heading Structure (H1–H4)](#4-heading-structure-h1h4)
5. [Image Alt Text](#5-image-alt-text)
6. [Schema Markup (JSON-LD)](#6-schema-markup-json-ld)
7. [Sitemap & Page Architecture](#7-sitemap--page-architecture)
8. [Priority Checklist](#8-priority-checklist)

---

## 1. Prerequisites & Plugins

Install **one** of these SEO plugins (do not use both):

- **Yoast SEO** (recommended): https://wordpress.org/plugins/wordpress-seo/
- **RankMath SEO**: https://rankmath.com/wordpress/plugin/seo-suite/

These plugins handle title tags, meta descriptions, XML sitemaps, and Open Graph tags from the WordPress admin — no theme file editing required for items 2 and 3.

---

## 2. Title Tags

Update via **Yoast SEO / RankMath > Edit Post/Page > SEO Title field**.

### Homepage (`https://goodvibrationz.co.za/`)

```html
<!-- CURRENT (inferred) -->
<title>Good Vibrationz</title>

<!-- REPLACE WITH -->
<title>Good Vibrationz | Cape Town Wedding & Events DJ | DJ Mat Pheiffer</title>
```

**Character count:** 65 (within 60–70 char limit ✅)

---

### Contact Page (`https://goodvibrationz.co.za/contact-us/`)

```html
<!-- CURRENT -->
<title>Contact Us – Good Vibrationz</title>

<!-- REPLACE WITH -->
<title>Book DJ Mat | Cape Town Wedding DJ Enquiries | Good Vibrationz</title>
```

**Character count:** 67 ✅

---

## 3. Meta Descriptions

Add via **Yoast SEO / RankMath > Edit Post/Page > Meta Description field**.

### Homepage

```html
<!-- ADD THIS (currently missing) -->
<meta name="description" content="Cape Town wedding &amp; events DJ Mat Pheiffer brings professional sound, lighting &amp; personalised playlists to your big day. Packages from R6,000. Get a free quote!">
```

**Character count:** 158 (within 150–160 char limit ✅)

---

### Contact Page

```html
<!-- ADD THIS (currently missing) -->
<meta name="description" content="Ready to book DJ Mat for your Cape Town wedding or event? Get in touch for a free consultation. Call 0846766704 or send us a message today.">
```

**Character count:** 143 ✅

---

## 4. Heading Structure (H1–H4)

Edit headings in the **WordPress page/block editor** or via the active theme/page builder.

### Homepage (`https://goodvibrationz.co.za/`)

#### H1 — Primary Page Heading

```html
<!-- CURRENT -->
<h1>Unforgettable Entertainment for Your Wedding</h1>

<!-- REPLACE WITH -->
<h1>Cape Town Wedding &amp; Events DJ | Unforgettable Music by DJ Mat Pheiffer</h1>
```

**Reason:** H1 is the strongest on-page ranking signal. Must contain primary keyword ("Cape Town Wedding DJ").

---

#### H2s — Section Headings

```html
<!-- CURRENT -->
<h2>Cape Town-Based Wedding &amp; Events DJ</h2>
<!-- REPLACE WITH -->
<h2>Cape Town's Professional Wedding DJ &amp; Events Specialist</h2>

<!-- CURRENT -->
<h2>Explore Our Customizable DJ Services</h2>
<!-- REPLACE WITH -->
<h2>Wedding DJ Packages in Cape Town – Tailored to Your Event</h2>

<!-- CURRENT -->
<h2>Let's Make Memories Together</h2>
<!-- REPLACE WITH -->
<h2>Book DJ Mat – Cape Town's Wedding DJ Since 2004</h2>

<!-- CURRENT -->
<h2>Tailored Experiences That Dance to Your Beat</h2>
<!-- REPLACE WITH -->
<h2>Personalised DJ Services for Weddings, Corporate Events &amp; Private Parties</h2>

<!-- CURRENT -->
<h2>What Our Clients Say</h2>
<!-- REPLACE WITH -->
<h2>Cape Town Wedding DJ Reviews &amp; Testimonials</h2>
```

---

#### H3s — Service Package Headings

```html
<!-- CURRENT -->
<h3>BASIC</h3>
<!-- REPLACE WITH -->
<h3>Basic Wedding DJ Package – R6,000</h3>

<!-- CURRENT -->
<h3>HAPPY MEDIUM</h3>
<!-- REPLACE WITH -->
<h3>Standard Wedding DJ Package – R9,500</h3>

<!-- CURRENT -->
<h3>GOING BIG</h3>
<!-- REPLACE WITH -->
<h3>Premium Wedding DJ Package – R17,500</h3>
```

**Reason:** Including pricing in headings improves eligibility for Google featured snippets when users search "Cape Town wedding DJ price."

---

### Contact Page (`https://goodvibrationz.co.za/contact-us/`)

**Critical Issue:** This page has **two H1 tags**. There must be exactly one H1 per page.

```html
<!-- CURRENT — TWO H1s (WRONG) -->
<h1>Get in Touch</h1>
<h1>We'd Love to Hear from You!</h1>

<!-- REPLACE WITH — ONE H1, ONE H2 (CORRECT) -->
<h1>Book DJ Mat for Your Cape Town Wedding or Event</h1>
<h2>We'd Love to Hear from You</h2>
```

---

## 5. Image Alt Text

Update alt attributes in the **WordPress Media Library** or directly in the block editor image settings.

| Image Description | Current Alt Text | Replace With |
|-------------------|-----------------|--------------|
| Mat Pheiffer profile photo | `PHOTO-2024-11-20-13-07-09` | `DJ Mat Pheiffer – Cape Town Wedding DJ` |
| DJ performing at event | *(empty)* | `Good Vibrationz DJ performing at Cape Town wedding reception` |
| DJ equipment / lighting setup | *(empty)* | `Professional DJ lighting setup at Cape Town wedding venue` |
| Ceremony/canapes setup | *(empty)* | `DJ Mat Pheiffer sound setup for wedding ceremony in Cape Town` |

**Rule:** Every `<img>` must have a descriptive, keyword-relevant `alt` attribute. Decorative images should use `alt=""`.

**In WordPress block editor:** Click image → "Alt text" field in right sidebar.

---

## 6. Schema Markup (JSON-LD)

Add the following structured data to the **homepage only**. In WordPress, use **Yoast SEO Premium** (Schema tab), **RankMath** (Schema Builder), or insert via a plugin like **Insert Headers and Footers** (free).

Paste into: **Settings > Insert Headers and Footers > Scripts in Header**

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["LocalBusiness", "EntertainmentBusiness"],
      "@id": "https://goodvibrationz.co.za/#business",
      "name": "Good Vibrationz",
      "alternateName": "DJ Mat Pheiffer",
      "description": "Professional wedding and events DJ based in Cape Town, South Africa. Serving weddings, corporate events, and private parties since 2004.",
      "url": "https://goodvibrationz.co.za/",
      "telephone": "+27846766704",
      "email": "info@goodvibrationz.co.za",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Southern Suburbs",
        "addressRegion": "Cape Town",
        "addressCountry": "ZA"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": "-33.9648",
        "longitude": "18.4655"
      },
      "areaServed": {
        "@type": "City",
        "name": "Cape Town"
      },
      "priceRange": "R6000–R17500",
      "currenciesAccepted": "ZAR",
      "openingHours": "Mo-Su 08:00-22:00",
      "sameAs": [
        "https://wa.me/27846766704"
      ],
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Wedding DJ Packages",
        "itemListElement": [
          {
            "@type": "Offer",
            "name": "Basic Wedding DJ Package",
            "price": "6000",
            "priceCurrency": "ZAR",
            "description": "6-hour DJ performance, sound for 80 guests, one setup, 3 lighting effects, corded mic, 30km travel"
          },
          {
            "@type": "Offer",
            "name": "Standard Wedding DJ Package",
            "price": "9500",
            "priceCurrency": "ZAR",
            "description": "8-hour performance, 150-guest capacity, 3 setups, 5 lighting effects, cordless mic, 80km travel"
          },
          {
            "@type": "Offer",
            "name": "Premium Wedding DJ Package",
            "price": "17500",
            "priceCurrency": "ZAR",
            "description": "10-hour performance with assistant, 250-guest capacity, 3 setups, 8 lighting effects, cordless mic, 120km travel"
          }
        ]
      }
    },
    {
      "@type": "WebSite",
      "@id": "https://goodvibrationz.co.za/#website",
      "url": "https://goodvibrationz.co.za/",
      "name": "Good Vibrationz",
      "publisher": {
        "@id": "https://goodvibrationz.co.za/#business"
      }
    }
  ]
}
</script>
```

**Validate at:** https://validator.schema.org/ and https://search.google.com/test/rich-results

---

## 7. Sitemap & Page Architecture

### Current State

The sitemap at `https://goodvibrationz.co.za/sitemap.xml` contains only **2 URLs**. All services, about info, and testimonials live as anchor links (`#services`, `#about`) on a single page — Google cannot index these individually.

### Recommended New Pages (Future Phase)

Create these as dedicated WordPress pages to capture additional keyword traffic:

| Slug | Target Keywords | Priority |
|------|----------------|----------|
| `/wedding-dj-cape-town/` | "wedding DJ Cape Town", "Cape Town wedding DJ hire" | High |
| `/corporate-events-dj-cape-town/` | "corporate events DJ Cape Town" | Medium |
| `/dj-packages-pricing/` | "wedding DJ price Cape Town", "DJ hire cost" | High |
| `/about-dj-mat/` | "DJ Mat Pheiffer", E-E-A-T authority signals | Medium |
| `/gallery/` | image SEO, social proof | Low |

### Sitemap Configuration (Yoast/RankMath)

Once new pages are created:
- Enable XML sitemap: **Yoast > General > Features > XML Sitemaps: ON**
- Submit to Google Search Console: `https://goodvibrationz.co.za/sitemap_index.xml`
- Re-submit after any major content additions

---

## 8. Priority Checklist

### Phase 1 — Quick Wins (< 1 hour total)

- [ ] Install Yoast SEO or RankMath plugin
- [ ] Set homepage `<title>` tag
- [ ] Set contact page `<title>` tag
- [ ] Add homepage meta description
- [ ] Add contact page meta description
- [ ] Fix double H1 on contact page → one H1, one H2
- [ ] Update homepage H1 to include "Cape Town Wedding DJ"

### Phase 2 — Content & Structure (2–4 hours)

- [ ] Update all H2s on homepage (5 headings)
- [ ] Update H3 service package headings (3 headings)
- [ ] Add alt text to all images via Media Library
- [ ] Insert JSON-LD schema via Headers & Footers plugin
- [ ] Validate schema at https://validator.schema.org/
- [ ] Submit sitemap to Google Search Console

### Phase 3 — Page Architecture (ongoing)

- [ ] Create `/wedding-dj-cape-town/` landing page
- [ ] Create `/dj-packages-pricing/` page
- [ ] Create `/about-dj-mat/` page
- [ ] Set up Google Search Console and Google Analytics

---

---

*Prepared by [All Done Sites](https://alldonesites.com) for DJ Mat Pheiffer — goodvibrationz.co.za — March 2026*

*All Done Sites provides hassle-free website subscriptions for small businesses: design, hosting, maintenance, and updates for one monthly fee. For questions about this audit or ongoing SEO maintenance, contact us at alldonesites.com.*
