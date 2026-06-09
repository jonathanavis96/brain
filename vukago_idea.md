# Project: VukaGo

Location: /home/grafe/code/vukago
Purpose: B2B travel portal for VukaGo - a platform enabling travel agents to browse, book, and manage African travel services (activities, hotels, transfers, car hire, packages, meals). Semi-automated system with manual fulfillment. Agent registration requires admin approval.
Tech Stack: Next.js, TypeScript, Tailwind CSS, PostgreSQL, Prisma
Goals: Build the B2B agent portal with registration/approval flow, product catalogue (activities, itineraries, transfers, hotels, meals, car hire, packages), cart/checkout, multi-currency pricing (INR/ZAR), admin dashboard for product/booking management, and manual invoicing/voucher upload

## Detailed Description

VukaGo is a B2B travel platform ("Africa. Simple.") connecting travel professionals with African travel services. The platform has two sides:

**Agent Portal (B2B):**
- Registration with document upload, admin approval required before access
- Browse product catalogue: Activities, Hotels, Transfers, Car Hire, Packages, Meals
- Add to cart and checkout
- Payment via wallet or payment gateways (INR/ZAR)
- View booking status, vouchers, and invoices

**Admin Dashboard:**
- Approve/reject agent registrations
- Upload and manage products across all modules
- Set pricing, discounts, voucher codes
- Receive booking alerts
- Manually process bookings with suppliers
- Upload vouchers and invoices to agents

**Product Modules:**
1. Activities: description, media, pricing, reviews
2. Transfers: routes, vehicle type, timing
3. Car Hire: duration, vehicle, capacity
4. Packages: bundled services
5. Meals: restaurant-based offerings
6. Hotels: room inventory and pricing

**Key Features:**
- Discount vouchers with validity periods
- Multi-currency pricing (INR/ZAR)
- Semi-automated: booking + payment automated, fulfillment manual
- Basic pricing guides per itinerary / added activity / meal / hotel

**Brand Identity:**
- Tagline: "Africa. Simple."
- Colors: Teal #1F5F5B (primary), Gold #BFA14A (accent/CTA), Charcoal #2B2B2B (body text), Soft Background #F7F7F5
- Typography: Inter/Poppins, bold headings, regular body
- UI: Clean layouts, white space, teal dominant, gold sparingly for CTAs

## Success Criteria

- [ ] Agent registration with document upload and admin approval flow
- [ ] Product catalogue with all 6 modules browsable
- [ ] Cart and checkout flow functional
- [ ] Admin dashboard for product and agent management
- [ ] Multi-currency pricing display
- [ ] Basic quote request system with offline pricing guides
- [ ] Invoice and voucher upload by admin

## Technical Requirements

- Next.js App Router with TypeScript
- Tailwind CSS with VukaGo brand design tokens
- PostgreSQL with Prisma ORM
- NextAuth.js for authentication (role-based: agent, admin)
- File upload support (agent documents, product media, vouchers/invoices)
- Responsive design, mobile-first

## Notes

This is a client project for Jess. The system is intentionally semi-automated - booking and payment are automated but fulfillment (supplier coordination) remains manual for now, with future API integration planned. Stock availability shows availability status but not quantities.
