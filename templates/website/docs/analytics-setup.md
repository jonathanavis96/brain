# Analytics Setup Guide

## Purpose

Step-by-step guide for setting up analytics tracking on your website. Focus on conversion tracking and actionable insights.

## Quick Start

### Google Analytics 4 (Recommended)

**1. Create Account**

- Go to <https://analytics.google.com>
- Click "Start measuring"
- Enter account and property details
- Accept terms

**2. Get Tracking Code**

- Navigate to Admin → Data Streams → Web
- Copy Measurement ID (looks like `G-XXXXXXXXXX`)

**3. Install Code**

```html
<!-- Add to <head> of every page -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

**4. Verify**

- Visit your site
- Check Google Analytics → Reports → Realtime
- Should see 1 active user (you)

## Event Tracking

### Standard Events

Track key user actions:

**Form Submission**

```javascript
// Track when contact form is submitted
document.getElementById('contact-form').addEventListener('submit', function(e) {
  gtag('event', 'form_submit', {
    'form_name': 'contact',
    'form_location': 'contact_page'
  });
});
```

**Button Clicks**

```javascript
// Track CTA button clicks
document.querySelectorAll('.cta-button').forEach(function(button) {
  button.addEventListener('click', function() {
    gtag('event', 'cta_click', {
      'button_text': this.textContent,
      'button_location': this.dataset.location || 'unknown'
    });
  });
});
```

**Phone Call**

```javascript
// Track phone number clicks
document.querySelectorAll('a[href^="tel:"]').forEach(function(link) {
  link.addEventListener('click', function() {
    gtag('event', 'phone_call', {
      'phone_number': this.href.replace('tel:', '')
    });
  });
});
```

**Email Click**

```javascript
// Track email clicks
document.querySelectorAll('a[href^="mailto:"]').forEach(function(link) {
  link.addEventListener('click', function() {
    gtag('event', 'email_click', {
      'email_address': this.href.replace('mailto:', '')
    });
  });
});
```

### Custom Events

**Booking/Consultation Request**

```javascript
// Track booking button clicks
function trackBooking() {
  gtag('event', 'booking_request', {
    'service_type': 'individual_therapy', // dynamic value
    'value': 150, // estimated value (optional)
    'currency': 'USD'
  });
}

// Use on booking buttons
<button onclick="trackBooking()">Book Consultation</button>
```

**Scroll Depth**

```javascript
// Track when user scrolls to bottom of page
let scrollTracked = false;

window.addEventListener('scroll', function() {
  if (scrollTracked) return;
  
  const scrollPercentage = (window.scrollY + window.innerHeight) / document.body.scrollHeight;
  
  if (scrollPercentage > 0.9) {
    gtag('event', 'scroll_depth', {
      'percentage': 90
    });
    scrollTracked = true;
  }
});
```

**Time on Page**

```javascript
// Track engaged time (user actively on page)
let startTime = Date.now();
let isActive = true;

// Track visibility
document.addEventListener('visibilitychange', function() {
  if (document.hidden) {
    isActive = false;
  } else {
    isActive = true;
    startTime = Date.now();
  }
});

// Send engagement time on page unload
window.addEventListener('beforeunload', function() {
  if (isActive) {
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    gtag('event', 'engagement_time', {
      'page': window.location.pathname,
      'seconds': timeSpent
    });
  }
});
```

## Conversion Goals

### Setup in GA4

1. Navigate to Admin → Events
2. Click "Create Event" or "Mark as conversion"
3. Select your custom events (form_submit, booking_request, etc.)
4. Toggle "Mark as conversion"

### Key Conversions to Track

| Conversion | Event Name | Trigger |
|------------|------------|---------|
| Contact form submit | `form_submit` | Form submission |
| Booking request | `booking_request` | Booking button click |
| Phone call | `phone_call` | Phone link click |
| Email inquiry | `email_click` | Email link click |
| Newsletter signup | `newsletter_signup` | Newsletter form submit |

## Privacy & Compliance

### Cookie Consent

**Required in EU/UK (GDPR):**

```html
<!-- Simple cookie consent banner -->
<div id="cookie-banner" style="display:none; position:fixed; bottom:0; width:100%; background:#333; color:#fff; padding:20px; text-align:center;">
  <p>We use cookies to improve your experience. <a href="/privacy" style="color:#fff; text-decoration:underline;">Privacy Policy</a></p>
  <button onclick="acceptCookies()" style="background:#4CAF50; color:#fff; border:none; padding:10px 20px; cursor:pointer;">Accept</button>
  <button onclick="declineCookies()" style="background:#f44336; color:#fff; border:none; padding:10px 20px; cursor:pointer;">Decline</button>
</div>

<script>
  // Check if user has made choice
  if (!localStorage.getItem('cookieConsent')) {
    document.getElementById('cookie-banner').style.display = 'block';
  }

  function acceptCookies() {
    localStorage.setItem('cookieConsent', 'accepted');
    document.getElementById('cookie-banner').style.display = 'none';
    // Initialize analytics here if not already done
  }

  function declineCookies() {
    localStorage.setItem('cookieConsent', 'declined');
    document.getElementById('cookie-banner').style.display = 'none';
    // Disable analytics
    window['ga-disable-G-XXXXXXXXXX'] = true;
  }
</script>
```

### Privacy Policy

**Required sections:**

- What data you collect (IP, device, behavior)
- How you use it (improve site, understand visitors)
- Third parties (Google Analytics)
- User rights (opt-out, data deletion)
- Contact information

**Google Analytics opt-out:**

```html
<a href="javascript:gaOptout()">Click here to opt out of Google Analytics</a>

<script>
function gaOptout() {
  document.cookie = 'ga-disable-G-XXXXXXXXXX=true; expires=Thu, 31 Dec 2099 23:59:59 UTC; path=/';
  window['ga-disable-G-XXXXXXXXXX'] = true;
  alert('Google Analytics has been disabled');
}
</script>
```

## Alternative Analytics (Privacy-Focused)

### Plausible Analytics

**Pros:**

- No cookies (GDPR-friendly)
- Lightweight (< 1KB)
- Simple interface
- No personal data collected

**Setup:**

```html
<script defer data-domain="yourdomain.com" src="https://plausible.io/js/script.js"></script>
```

**Cost:** $9/month (10k pageviews)

### Fathom Analytics

**Pros:**

- No cookies
- EU-hosted option
- Privacy-first

**Setup:**

```html
<script src="https://cdn.usefathom.com/script.js" data-site="ABCDEFG" defer></script>
```

**Cost:** $14/month (10k pageviews)

## Dashboard Setup

### Key Metrics to Monitor

**Traffic:**

- Sessions
- Users
- Pageviews
- Top pages

**Engagement:**

- Average session duration
- Pages per session
- Bounce rate

**Conversions:**

- Form submissions
- Booking requests
- Phone calls
- Email clicks

**Sources:**

- Direct
- Organic search
- Social
- Referral

### Custom Dashboard (GA4)

1. Navigate to Explore → Blank
2. Add dimensions:
   - Page path
   - Event name
   - Source/medium
3. Add metrics:
   - Users
   - Sessions
   - Conversions
4. Save as "Website Performance"

## Testing

### Verify Tracking

**1. Use GA4 DebugView:**

- Install Google Analytics Debugger extension
- Visit your site
- Check GA4 → Admin → DebugView
- Trigger events (click buttons, submit forms)
- Verify events appear

**2. Browser DevTools:**

```javascript
// Check if gtag is loaded
console.log(typeof gtag); // Should output "function"

// Manually trigger test event
gtag('event', 'test_event', {'test_param': 'test_value'});
```

**3. Real-time Report:**

- GA4 → Reports → Realtime
- Visit site, trigger events
- Verify they appear in real-time

## Common Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| No data in GA4 | Tracking code not installed | Verify code in <head> |
| Events not tracking | Event code incorrect | Check syntax, test with DebugView |
| Data delayed | GA4 processing time | Wait 24-48 hours for historical reports |
| Duplicate tracking | Code installed twice | Search for multiple gtag instances |
| Self-traffic counted | No filter | Use IP filter in GA4 settings |

## Recommended Setup (Complete)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Website</title>

  <!-- Google Analytics -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-XXXXXXXXXX', {
      'anonymize_ip': true, // Anonymize IPs (GDPR)
      'cookie_flags': 'SameSite=None;Secure' // Cookie security
    });
  </script>
</head>
<body>
  <!-- Your content -->

  <!-- Event tracking -->
  <script>
    // Form submission tracking
    document.addEventListener('DOMContentLoaded', function() {
      const forms = document.querySelectorAll('form');
      forms.forEach(form => {
        form.addEventListener('submit', function(e) {
          gtag('event', 'form_submit', {
            'form_name': this.id || 'unknown',
            'form_action': this.action
          });
        });
      });

      // CTA button tracking
      const ctaButtons = document.querySelectorAll('.cta-button, [data-track="cta"]');
      ctaButtons.forEach(button => {
        button.addEventListener('click', function() {
          gtag('event', 'cta_click', {
            'button_text': this.textContent.trim(),
            'button_url': this.href || this.dataset.href || 'button'
          });
        });
      });

      // Phone call tracking
      const phoneLinks = document.querySelectorAll('a[href^="tel:"]');
      phoneLinks.forEach(link => {
        link.addEventListener('click', function() {
          gtag('event', 'phone_call');
        });
      });

      // Email click tracking
      const emailLinks = document.querySelectorAll('a[href^="mailto:"]');
      emailLinks.forEach(link => {
        link.addEventListener('click', function() {
          gtag('event', 'email_click');
        });
      });
    });
  </script>
</body>
</html>
```

## Related

- **[seo-checklist.md](seo-checklist.md)** - SEO implementation guide
- **brain/skills/domains/marketing/growth/analytics-tracking.md** - Advanced analytics patterns
- **brain/skills/domains/marketing/cro/ab-test-setup.md** - A/B testing setup
