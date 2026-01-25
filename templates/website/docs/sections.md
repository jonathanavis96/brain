# Page Section Composition

## Purpose

Defines the section order and content for each page. Follow the universal page flow for optimal conversion.

## Universal Page Flow

Every effective page follows this psychological sequence:

```text
1. ATTENTION → Hero (what is this, is it for me?)
2. TRUST → Social proof (can I trust this?)
3. VALUE → Services/benefits (what do I get?)
4. CLARITY → Process/how it works (what happens next?)
5. CONNECTION → About/story (who is behind this?)
6. OBJECTIONS → FAQ (what about my concerns?)
7. ACTION → CTA (what do I do now?)
```

## Homepage

### Section Order

1. **Hero**
   - Headline (value proposition, 8-12 words)
   - Subheadline (who it's for, 15-25 words)
   - Primary CTA button
   - Trust line (social proof snippet)
   - Supporting image/photo

2. **Social Proof**
   - 3-5 testimonials with photos
   - OR credentials/certifications
   - OR client logos (B2B)

3. **Services Overview**
   - 3-4 main services as cards
   - Icon + title + 2-3 sentence description
   - Link to full service page

4. **Process/How It Works**
   - 3-5 steps in linear flow
   - Reduce uncertainty, show what happens

5. **About Snippet**
   - Photo + 2-3 paragraphs
   - Why you're qualified
   - Link to full About page

6. **FAQ**
   - 5-7 most common questions
   - Accordion format

7. **Final CTA**
   - Repeat primary CTA
   - Simplified form or button

### Content Example

```markdown
## Hero

**Headline:** [Value proposition in 8-12 words]
**Subheadline:** [Who it's for and what they get, 15-25 words]
**CTA:** [Button text, 2-4 words]
**Trust Line:** [Social proof, e.g., "Trusted by 500+ clients since 2010"]

## Social Proof

- [Testimonial 1: Quote, name, context]
- [Testimonial 2: Quote, name, context]
- [Testimonial 3: Quote, name, context]

## Services

1. **Service A:** [2-3 sentences]
2. **Service B:** [2-3 sentences]
3. **Service C:** [2-3 sentences]
```

## About Page

### Section Order

1. **Hero/Intro**
   - Photo
   - Short headline
   - 1-2 sentence overview

2. **Story**
   - Why you started
   - Your approach/philosophy
   - 3-5 paragraphs

3. **Credentials**
   - Education
   - Certifications
   - Professional affiliations
   - Years of experience

4. **Values/Approach**
   - What makes you different
   - Your methods
   - What clients can expect

5. **Personal Touch**
   - Humanizing details
   - Hobbies/interests (if relevant)
   - Photo outside work context

6. **CTA**
   - "Ready to work together?"
   - Link to contact/booking

## Services Page

### Section Order

1. **Overview**
   - What you offer (general)
   - Who it's for

2. **Service Listings**
   - Each service as section:
     - Name
     - Who it's for
     - What's included
     - Duration/format
     - Pricing (if shown)
     - CTA button

3. **Process**
   - How working together looks
   - Step-by-step

4. **FAQ**
   - Service-specific questions

5. **CTA**
   - Book/contact

### Service Detail Pages (if separate)

Each service gets own page with:

1. **Hero**
   - Service name
   - One-sentence value
   - CTA

2. **Overview**
   - Who it's for (3-5 bullet points)
   - What they'll achieve

3. **What's Included**
   - Detailed breakdown
   - Duration, format, frequency

4. **Process**
   - Step-by-step for this service

5. **Pricing** (optional)
   - Clear pricing
   - What's included
   - Package options

6. **FAQ**
   - Service-specific

7. **Testimonials**
   - 2-3 relevant to this service

8. **CTA**
   - Book/inquire

## Contact Page

### Section Order

1. **Hero**
   - "Let's Connect" or similar
   - 1-2 sentences on what to expect

2. **Contact Form**
   - Name, Email, Message (minimum)
   - Optional: Phone, Service Interest, Preferred Contact Method

3. **Contact Details**
   - Email
   - Phone
   - Address (if applicable)
   - Hours

4. **Map** (if physical location)
   - Embedded Google Map

5. **FAQ**
   - "How quickly will you respond?"
   - "What happens after I submit?"
   - "Do you offer virtual sessions?"

## Blog Page (if applicable)

### Layout

1. **Header**
   - "Blog" or "Insights"
   - Filter/search

2. **Post Grid**
   - 3-column grid
   - Featured image
   - Title
   - Excerpt
   - Date
   - Read time

3. **Pagination**

### Individual Blog Post

1. **Hero**
   - Title
   - Date
   - Read time
   - Author

2. **Content**
   - Introduction
   - Body (sections with H2/H3)
   - Conclusion

3. **Author Bio**
   - Photo
   - 2-3 sentences
   - Link to About

4. **Related Posts**
   - 3 related articles

5. **CTA**
   - Newsletter signup
   - OR contact link

## 404 Error Page

1. **Friendly Message**
   - "Oops, page not found"
   - Lighthearted tone

2. **Search** (if applicable)

3. **Quick Links**
   - Home
   - Services
   - Contact

4. **CTA**
   - "Get in touch if you need help"

## Section Content Template

Use this template when planning each page:

```markdown
# [Page Name]

## Section 1: [Section Type]

**Goal:** [What this section achieves]
**Content:**
- [Element 1]
- [Element 2]

## Section 2: [Section Type]

**Goal:** [What this section achieves]
**Content:**
- [Element 1]
- [Element 2]

[Repeat for all sections]
```

## Section Component Mapping

| Section Type | Component Name | Props |
|--------------|----------------|-------|
| Hero | `<Hero>` | headline, subheadline, ctaText, ctaLink, trustLine, image |
| Social Proof | `<Testimonials>` | testimonials[] |
| Services | `<ServiceCards>` | services[] |
| Process | `<ProcessSteps>` | steps[] |
| About | `<AboutSnippet>` | text, image, link |
| FAQ | `<FAQ>` | questions[] |
| CTA | `<CTASection>` | headline, text, buttonText, buttonLink |

## Related

- **[sitemap.md](sitemap.md)** - Navigation structure
- **brain/skills/domains/websites/architecture/section-composer.md** - Section composition patterns
- **brain/skills/domains/websites/copywriting/value-proposition.md** - Writing headlines
- **brain/skills/domains/websites/copywriting/cta-optimizer.md** - CTA best practices
