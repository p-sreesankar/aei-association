# Product Requirements Document: AEI Association — AEI, CET

## Version 1.1 · June 3, 2026

---

## 1. Problem Statement

Students of the Applied Electronics and Instrumentation (AEI) department at College of Engineering Trivandrum (CET) currently lack a single, accessible, student-friendly digital presence where they can find department notices, upcoming events, downloadable resources, a photo gallery, and a channel to submit grievances. Information is scattered across WhatsApp groups, notice boards, and word-of-mouth — leading to missed deadlines, uneven access, and no clear grievance path.

"AEI Association" is a fully static public website hosted on Vercel that consolidates all student-facing information into one mobile-first destination, maintained by a single non-developer maintainer who edits JavaScript data files and pushes to GitHub.

---

## 2. Goals & Non-Goals

### Goals

- G1: Give every AEI student instant, mobile-friendly access to notices, events, resources, and contacts.
- G2: Provide a grievance submission channel via an embedded Google Form — zero backend.
- G3: Make content updates trivial — edit a `.js` data file, push, done. No build step required.
- G4: Run at minimal recurring cost (Vercel Hobby tier).
- G5: Reflect a warm, approachable visual identity that feels student-centric, not bureaucratic.

### Non-Goals

- User authentication / login — Out of scope; fully public, read-only site.
- Server-side processing or database — Static-only constraint; Google Forms handles submissions.
- CMS / admin dashboard — Maintainer edits data files directly; a CMS adds complexity with no proportional benefit at this scale.
- Multi-department support — Scoped to AEI only; other departments can fork the repo later.
- Analytics dashboard — Can be added later via Google Analytics snippet; not in v1.

---

## 3. User Personas

### 3.1 Student Visitor — "Arjun"

- Who: 2nd-year AEI student, accesses everything on his phone.
- Needs: Check if a new notice was posted, find when the next event is, download a form, browse event photos, submit a grievance.
- Frustrations: Misses notices shared only on obscure WhatsApp groups. Can't find the right form. Doesn't know whom to contact.
- Success looks like: Opens the site on mobile → finds what he needs within 2 taps → leaves satisfied.

### 3.2 Site Maintainer — "Sreesankar"

- Who: Student/faculty who manages the site. Has basic Git + GitHub knowledge.
- Needs: Add a new notice, event, gallery image, or resource link without touching HTML/CSS. Push and see the change live.
- Frustrations: Complex build pipelines, template engines, or CMS logins that add friction.
- Success looks like: Opens `data/notices.js` → adds a new object → `git push` → live in < 2 minutes.

---

## 4. Section-by-Section Feature Spec

### 4.1 Home

- Purpose: First impression + navigation hub.
- Content: Hero banner with association name ("AEI Association — AEI, CET"), a one-line tagline, and a grid/row of quick-link cards to every other section.
- Behavior: Smooth-scroll or anchor links to each section (single-page app feel). On mobile, quick-link cards stack into a 2-column grid.
- Acceptance Criteria:
  - AC-1: Page loads in < 2 s on 3G.
  - AC-2: All 7 section links visible without scrolling on desktop.
  - AC-3: Hero image/gradient renders correctly on viewports from 320 px to 1440 px.

### 4.2 About the Association

- Purpose: Explain the association's mission, scope, and team.
- Content: 2–3 paragraphs of static text + optional team photo/illustration. Driven by `data/about.js`.
- Behavior: Pure text render; no interactivity.
- Acceptance Criteria:
  - AC-4: Content renders from data file, not hard-coded HTML.
  - AC-5: Paragraph text is readable (≥ 16 px body, ≥ 1.5 line-height).

### 4.3 Notice Board

- Purpose: Chronological list of announcements.
- Content: Each notice has title, date, short description, optional attachment URL. Sourced from `data/notices.js`.
- Behavior: Rendered newest-first. If attachment URL exists, show a "View / Download" button/link. Optional: A "pinned" flag to keep important notices at the top.
- Acceptance Criteria:
  - AC-6: Notices render in reverse-chronological order.
  - AC-7: Attachment link opens in a new tab.
  - AC-8: A notice without an attachment renders cleanly with no broken link.
  - AC-9: Adding a new object to `notices.js` and refreshing shows it immediately.

### 4.4 Event Calendar

- Purpose: Surface upcoming and past events.
- Content: Each event has name, date, venue, short description, optional image URL, status tag (upcoming / completed). Sourced from `data/events.js`.
- Behavior: Events with dates >= today render under "Upcoming"; the rest under "Past Events" (automatic, based on date comparison at render time). Optional image displayed as a card thumbnail.
- Acceptance Criteria:
  - AC-10: Events auto-classify into upcoming/past based on current date.
  - AC-11: Past events section is collapsible or paginated (if > 10 items).
  - AC-12: Missing image gracefully falls back to a placeholder or text-only card.

### 4.5 Gallery

- Purpose: Photo grid showcasing department life.
- Content: Array of image objects (URL, caption, optional event tag). Sourced from `data/gallery.js`. Images hosted externally (Google Drive/Photos direct links, or committed to `assets/gallery/`).
- Behavior: Responsive masonry or uniform grid. Click/tap opens a lightbox overlay (pure CSS/JS, no library dependency heavier than 5 KB).
- Acceptance Criteria:
  - AC-13: Grid renders >= 3 columns on desktop, 2 on tablet, 1 on phone.
  - AC-14: Lightbox shows full image + caption; close on click-outside or X button.
  - AC-15: Lazy-loads images below the fold (native `loading="lazy"`).

### 4.6 Resources & Downloads

- Purpose: Central hub for forms, guides, and documents.
- Content: Each resource has title, description, category tag, external URL (Google Drive link). Sourced from `data/resources.js`.
- Behavior: Rendered as a list or card grid, optionally filterable by category tag (client-side JS filter). Links open in a new tab.
- Acceptance Criteria:
  - AC-16: Each resource link opens in a new tab (`target="_blank"`, `rel="noopener"`).
  - AC-17: Category filter (if present) works without page reload.
  - AC-18: An empty resources array renders a friendly "No resources available yet" message.

### 4.7 Grievance Form

- Purpose: Let students submit grievances without leaving the site.
- Content: An embedded Google Form via `<iframe>`. The form URL is stored in `data/config.js` for easy replacement.
- Behavior: Iframe fills available width (max 720 px), scrollable. Brief intro text above the iframe explaining what to expect after submission.
- Acceptance Criteria:
  - AC-19: Iframe loads and is interactive on Chrome, Firefox, Safari, Edge (latest).
  - AC-20: On mobile, iframe scrolls independently within the page.
  - AC-21: Changing the URL in `config.js` swaps the form with zero HTML edits.

### 4.8 Contact Us

- Purpose: Faculty/coordinator contact information.
- Content: Array of contact cards (name, designation, email, phone, optional photo URL). Sourced from `data/contacts.js`.
- Behavior: Cards rendered in a responsive grid. Email rendered as a `mailto:` link; phone as a `tel:` link (tap-to-call on mobile).
- Acceptance Criteria:
  - AC-22: Tap on phone number initiates a call on mobile devices.
  - AC-23: Tap on email opens default mail client.
  - AC-24: Missing photo falls back to initials avatar or placeholder icon.

---

## 5. Content Schema — Data Files

All data files live in a `/data` directory and export plain JS arrays/objects consumable by the site's rendering script.

### `data/config.js` — Global site configuration

```
{
  siteName:         String   — "AEI Association"
  tagline:          String   — "AEI Department, College of Engineering Trivandrum"
  grievanceFormUrl: String   — full Google Form embed URL
  footerText:       String   — "© 2026 AEI Association — AEI, CET"
}
```

### `data/about.js` — About section content

```
{
  heading:      String        — section heading
  paragraphs:   [String]      — array of paragraph texts
  teamPhotoUrl: String | null — optional team photo URL
}
```

### `data/notices.js` — Notice board entries

```
[
  {
    id:            String        — unique slug, e.g. "mid-sem-schedule-2026"
    title:         String        — "Mid-Semester Exam Schedule Published"
    date:          String        — "YYYY-MM-DD" (ISO 8601)
    description:   String        — short body text (1–3 sentences)
    attachmentUrl: String | null — link to PDF/Drive file
    pinned:        Boolean       — true to stick at top (default false)
  }
]
```

### `data/events.js` — Event calendar entries

```
[
  {
    id:          String        — unique slug
    name:        String        — "TechFest 2026"
    date:        String        — "YYYY-MM-DD"
    venue:       String        — "Seminar Hall, CET"
    description: String        — 1–3 sentences
    imageUrl:    String | null — thumbnail image URL
  }
]
```

Note: Status (upcoming/past) is derived at render time by comparing `date` to `new Date()`. No explicit status field needed.

### `data/gallery.js` — Photo gallery items

```
[
  {
    url:      String        — direct image URL
    caption:  String        — "Annual Day 2025 — Group Photo"
    eventTag: String | null — optional tag for future filtering, e.g. "annual-day-2025"
  }
]
```

### `data/resources.js` — Downloadable resources

```
[
  {
    title:       String — "Lab Manual — AEI S6"
    description: String — brief note about the file
    category:    String — "form" | "guide" | "syllabus" | "other"
    url:         String — Google Drive shareable link
  }
]
```

### `data/contacts.js` — Faculty/coordinator cards

```
[
  {
    name:        String        — "Dr. Anitha S."
    designation: String        — "Association Coordinator, Assoc. Professor"
    email:       String        — "anitha@cet.ac.in"
    phone:       String        — "+91-XXXXXXXXXX"
    photoUrl:    String | null — headshot URL
  }
]
```

---

## 6. Success Metrics

- Page Load (mobile 3G): First Contentful Paint < 2 s — measured via Lighthouse / PageSpeed Insights.
- Mobile Usability: 0 mobile-usability errors — measured via Google Search Console.
- Content Freshness: New notice visible within 5 min of `git push` — manual check (Vercel deploy time).
- Maintainer Update Time: < 5 minutes to add a notice end-to-end — timed dry-run.
- Grievance Submissions: >= 1 submission within first 30 days of launch — Google Form response sheet.
- Lighthouse Score: >= 90 (Performance, Accessibility, Best Practices) — Lighthouse audit.
- Zero Downtime: 99.9% uptime — Vercel status / uptime monitor (e.g., UptimeRobot).

---

## 7. Future Scope (v2+, non-breaking additions)

- Google Analytics / Plausible snippet (Low effort) — Add `<script>` tag in `index.html`; no structural change.
- Dark mode toggle (Low effort) — CSS custom properties + a toggle switch; stored in `localStorage`.
- Gallery filtering by event tag (Low effort) — `eventTag` field already in schema; add client-side filter buttons.
- Search / filter across notices (Medium effort) — Client-side full-text search over the data arrays (e.g., Fuse.js, < 10 KB).
- Multilingual support: English + Malayalam (Medium effort) — Duplicate data files (`notices.ml.js`) + language toggle; no backend.
- PWA / offline access (Medium effort) — Add `manifest.json` + service worker; students can "install" the site.
- Student blog / articles section (Medium effort) — New `data/blog.js` + a card layout; same pattern as notices.
- RSS feed for notices (Low effort) — Generate a static `feed.xml` from `notices.js` via a small build script.
- Custom domain + HTTPS (Low effort) — Vercel domain settings + DNS records; free SSL provisioning.

All future additions follow the same pattern: new data file → new rendering block → push. The architecture does not need to change.

---

## Architecture Summary

```
/
├── index.html            ← single-page shell, section anchors
├── css/
│   └── style.css         ← all styles, mobile-first
├── js/
│   └── app.js            ← imports data files, renders sections into DOM
├── data/
│   ├── config.js
│   ├── about.js
│   ├── notices.js
│   ├── events.js
│   ├── gallery.js
│   ├── resources.js
│   └── contacts.js
├── assets/
│   ├── logo.png
│   └── gallery/          ← optional local images
├── CNAME                 ← future custom domain
└── README.md             ← maintainer guide
```

No build tools, no bundlers, no npm. Pure HTML + CSS + vanilla JS. The `data/*.js` files assign to global variables (e.g., `window.NOTICES = [...]`) or use ES module exports if targeting modern browsers only.

---

## Constraints Recap

- Minimal cost (Vercel Hobby hosting).
- No backend ever.
- Easy for a non-developer maintainer to update (edit JS data files + git push).
- Must work on mobile (students use phones).
- Warm, friendly, approachable design — feels made for students, not a government portal.
- Modern but not cold. College identity colors can be incorporated.
