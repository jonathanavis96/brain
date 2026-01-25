# Site Navigation Structure

## Purpose

Defines navigation structure for the website. Keep primary navigation to 4-7 items for optimal usability.

## Primary Navigation

```text
[Logo] Item 1 | Item 2 | Item 3 | Item 4 | [CTA Button]
```

### Recommended Structure

Replace with your actual navigation items:

1. **Home** - Landing page overview
2. **About** - Story, credentials, approach
3. **Services** - What you offer (can use dropdown if 3+ services)
4. **Contact** - Contact form and details

**CTA Button:** "Book Now" / "Get Started" / "Contact Us"

## Navigation Patterns

### Pattern A: Simple (4 items) - Best for most service sites

```text
[Logo] Home | About | Services | Contact [Book Now]
```

**Use when:**

- Solo practitioner or small business
- 1-3 services
- Clear conversion goal (booking, contact)

### Pattern B: With Dropdown (5-6 items)

```text
[Logo] Home | About | Services ▼ | Resources | Contact [Get Started]
                      ├── Service A
                      ├── Service B
                      └── Pricing
```

**Use when:**

- 3+ distinct services
- Pricing deserves own page
- Resources section (blog, FAQ)

### Pattern C: Product-Focused (5-7 items)

```text
[Logo] Product | Solutions | Pricing | Docs | Blog | Contact [Try Free]
```

**Use when:**

- SaaS or software product
- Multiple use cases
- Documentation needed
- Content marketing (blog)

## Example: Psychology Practice

```text
[Logo] Home | About Jacqui | Services | Contact [Book Consultation]
```

**Services dropdown (if needed):**

- Individual Therapy
- Couples Therapy
- Coaching

## Mobile Navigation

Mobile menu (hamburger) includes:

- All primary nav items
- CTA button at top
- Contact details at bottom

```text
☰ Menu

[Book Consultation] ← CTA button

Home
About
Services
  → Individual Therapy
  → Couples Therapy
  → Coaching
Contact

---
📧 email@example.com
📞 +27 123 456 789
```

## Footer Navigation

### Layout: 4-Column

| Column 1: About | Column 2: Services | Column 3: Resources | Column 4: Contact |
|-----------------|-------------------|---------------------|-------------------|
| Logo + tagline | Service A | FAQ | Email |
| Brief description | Service B | Blog | Phone |
| Social icons | Service C | Privacy Policy | Address |
| | Pricing | Terms | |

### Layout: 3-Column (Simpler)

| Column 1: Quick Links | Column 2: Services | Column 3: Contact |
|-----------------------|-------------------|-------------------|
| Home | Service A | Email |
| About | Service B | Phone |
| Services | Service C | Address |
| Contact | | Hours |

**Footer Bottom:**

```text
© 2026 [Business Name] | Privacy Policy | Terms of Service
```

## Sitemap (All Pages)

```text
Home (/)
├── About (/about)
├── Services (/services)
│   ├── Service A (/services/service-a)
│   ├── Service B (/services/service-b)
│   └── Pricing (/services/pricing)
├── Contact (/contact)
├── Blog (/blog) [optional]
│   └── [Blog Posts] (/blog/post-slug)
├── Privacy Policy (/privacy)
├── Terms of Service (/terms)
└── 404 Error (/404)
```

## URL Structure

| Page | URL | Notes |
|------|-----|-------|
| Home | `/` | Root |
| About | `/about` | Single page |
| Services | `/services` | Overview page |
| Service detail | `/services/individual-therapy` | Kebab-case |
| Contact | `/contact` | Single page |
| Blog post | `/blog/post-title` | If blog exists |
| Legal | `/privacy`, `/terms` | Single pages |

## Navigation Rules

### Do

- Keep primary nav to 4-7 items max
- Make labels clear and action-oriented
- Use dropdown only if 3+ subitems
- Include prominent CTA button
- Show active page state (highlight current page)

### Don't

- Use vague labels ("Resources", "More")
- Hide contact link (always visible)
- Create dropdown with 1 item
- Use jargon or internal names
- Exceed 7 primary nav items

## Related

- **[sections.md](sections.md)** - What goes IN each page
- **brain/skills/domains/websites/architecture/sitemap-builder.md** - Sitemap patterns
- **brain/skills/domains/websites/architecture/section-composer.md** - Section composition
