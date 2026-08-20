# Trio Molo Cafe — PRD

## Original Problem Statement
Premium landing page for Trio Molo Cafe (Kołobrzeg, pier café). Luxury restaurant / beach-club aesthetic (Nobu, Soho House, Velaa). Dark navy + sand + gold + Baltic turquoise, glassmorphism, wave/sunset animations, "10 000 zł" premium feel. Sections: Hero, info bar, About, bestseller menu, masonry gallery + lightbox, parallax atmosphere, testimonials, location (Google Maps), opening hours, contact form, footer. Editable menu & gallery via admin panel.

## User Choices
- Contact form recipient: trio.molo.cafe@onet.pl (hardcoded, NO email sending yet)
- Map: embedded Google Maps
- Images: professional stock photos
- Content: editable via admin panel + database
- Full premium animations, must be smooth (no jank)

## Architecture
- Frontend: React 19, Tailwind, framer-motion, lenis smooth scroll, yet-another-react-lightbox, react-fast-marquee. Fonts: Cormorant Garamond + Manrope.
- Backend: FastAPI + MongoDB (motor). JWT (Bearer) auth for single admin. Menu/Gallery CRUD, contact storage, seeded default content.
- Routes: `/` landing, `/admin/login`, `/admin` dashboard.

## Implemented (2026-08-20)
- Full premium landing page, all requested sections, Polish copy.
- Kinetic hero with masked line reveal, parallax bg, animated waves, sunset glow, scroll arrow.
- Glass info cards, parallax About, bestseller menu (from DB), masonry gallery with category filters + lightbox, parallax atmosphere + marquee, testimonials, Google Maps embed, hours table with live Open/Closed badge, contact form (stores to DB), footer.
- Admin: JWT login + dashboard to manage Menu and Gallery (create/edit/delete). Seeded 6 menu items + 10 gallery images.
- Verified: hero + admin login visually; all APIs (auth, protected CRUD, 401, contact, gallery/menu) via curl. Zero console errors.

## Credentials
Admin: admin@triomolo.pl / TrioMolo2025! (see /app/memory/test_credentials.md)

## Backlog
- P1: Wire contact form to actually send email (Resend) to trio.molo.cafe@onet.pl
- P1: Admin — view submitted contact messages
- P2: Full menu page/section (currently bestsellers + gallery)
- P2: Image upload in admin (object storage) instead of URL paste
- P2: Reservation flow for "Rezerwuj stolik"
