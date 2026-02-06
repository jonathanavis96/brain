# APP_FLOW

## What this file is

The **flow inventory**: a complete list of screens/pages/routes and the key user journeys.

For websites, you can treat this as a **site map + page behaviors** document (or rename it to
`SITE_MAP.md` in your pack if you prefer).

## Setup (how to start)

1. List every route/page/screen.
2. For each one, record:
   - primary user intent
   - primary action
   - required states (loading/empty/error)
3. Then list the 3–8 most important journeys end-to-end.

## Ask the user (minimum interview)

- What are the primary user personas?
- What are the top 3 user goals?
- Which flows must not change (behaviorally)?
- Where do users currently get stuck?
- What are the “success metrics” per flow (conversion, time-to-task)?

## Required sections (layout contract)

### 1) Screen/page inventory

For each screen/page:

- **Name**
- **Route/URL**
- **Primary user intent**
- **Primary CTA**
- **Key components**
- **States**: default / loading / empty / error
- **Data dependencies** (APIs, CMS, local storage)

### 2) Primary journeys

For each journey:

- **Name**
- **Entry point(s)**
- **Steps**
- **Success outcome**
- **Failure modes** (where it breaks)

## Completeness checklist

- [ ] Every user-visible route/page is listed
- [ ] Each page has states defined (no “mystery loading”)
- [ ] Top journeys cover the highest-value product outcomes
