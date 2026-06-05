# AEI Association Repository Guide

> **Last Updated:** 2026-06-03

This document is a handoff guide for a large external LLM task. It summarizes the repository, how the app is wired, where content lives, and what needs to change when adding a major new feature.

## 1. What This Repo Is

This is a static-content-first React site for the Applied Electronics and Instrumentation department at College of Engineering Trivandrum.

Core characteristics:

- React 18 + Vite + Tailwind CSS
- React Router v7 using browser-history routing
- Framer Motion for transitions and micro-interactions
- No runtime backend for public pages
- Content is stored in `src/data/*.js` and imported at build time
- Vercel hosts the site with SPA fallback
- Firebase is optional and used for analytics and an admin-only sync pipeline

The repo is designed so maintainers edit JavaScript data files instead of a CMS.

## 2. Startup Path

Main entry flow:

1. `index.html` mounts the React app into `#root`.
2. `src/main.jsx` creates the React root, wraps the app in `HelmetProvider`, and conditionally runs dev-only config validation.
3. `src/App.jsx` defines routing and wraps pages in the shared layout.
4. `src/components/layout/PageLayout.jsx` renders the shared UI shell: navbar, scroll indicator, main content, and footer.

Key runtime behavior:

- Production initializes Firebase analytics only if supported.
- Dev mode imports `src/utils/validate-config.js` dynamically so warnings appear in the console.
- Pages are lazy-loaded with `React.lazy` and rendered inside `Suspense` with `LoadingSpinner`.

## 3. Routing And Navigation

Primary route file: `src/App.jsx`

Routes currently in use:

- `/` -> Home
- `/about` -> About
- `/notices` -> Notices
- `/events` -> Events
- `/resources` -> Resources
- `/projects` -> Projects
- `/grievance` -> Grievance
- `/contact` -> Contact
- `*` -> NotFound

Important behavior:

- The app now uses `BrowserRouter`, not hash routing.
- Vercel already has a fallback to `/index.html`, so browser-history routing is safe.
- Section visibility is controlled by `SECTIONS` from `src/data/site-config.js`.

Navigation config file: `src/config/navigation.js`

- `NAV_LINKS` is derived from all links and filtered by `SECTIONS`.
- `SOCIAL_LINKS` drives footer social icons.
- `BRAND` provides site and department naming used in the header/footer.

Implication for new features:

- If the feature should be visible to users, it usually needs three changes: route, navigation entry, and a `SECTIONS` toggle.
- Home page quick links also need to be updated if the feature belongs on the landing page.

## 4. Layout And UI Shell

Shared layout: `src/components/layout/PageLayout.jsx`

Responsibilities:

- Renders `Navbar`, `ScrollProgress`, `CursorSpotlight`, and `Footer`
- Scrolls to top on route change
- Adds a fade/slide page transition via Framer Motion

Navbar: `src/components/layout/Navbar.jsx`

- Sticky glassmorphism header
- Desktop nav and mobile full-screen menu
- Active route indicator and hover affordances
- Prevents body scrolling while the mobile menu is open

Footer: `src/components/layout/Footer.jsx`

- Displays brand information
- Reuses nav links from the same config source
- Shows social links and contact email if configured

Layout exports: `src/components/layout/index.js`

- `Navbar`
- `Footer`
- `PageLayout`
- `SectionWrapper`

UI exports: `src/components/ui/index.js`

- `Button`
- `Card`
- `Badge`
- `SectionHeader`
- `EmptyState`
- `PageBanner`
- `DataSection`
- `Ticker`
- `ProjectShowcaseCard`

## 5. Data Model And Content Workflow

All public content is stored in JavaScript data modules under `src/data/`.

### Data files

- `src/data/site-config.js` -> global branding, contact info, theme colors, section toggles, grievance form URL
- `src/data/about.js` -> about page text and structure
- `src/data/notices.js` -> notice board entries
- `src/data/events.js` -> event calendar
- `src/data/resources.js` -> resources/downloads dataset
- `src/data/projects.js` -> project showcase cards
- `src/data/faculty.js` -> contact directory
- `src/data/mock-tests.js` -> present, currently not wired into routes

### Editing flow

1. Edit the relevant `src/data/*.js` file.
2. Run `npm run validate:config`.
3. Run `npm run validate:resources` if resources changed.
4. Run `npm run build`.
5. Commit and push to `main` to deploy through Vercel.

### Site config shape

`src/data/site-config.js` exports:

- `SITE_CONFIG`
- `SECTIONS`

Key fields in `SITE_CONFIG`:

- `siteName`
- `departmentName`
- `departmentShort`
- `collegeName`
- `collegeShort`
- `tagline`
- `footerText`
- `grievanceFormUrl`
- `socialLinks`
- `themeColors`
- `metaDescription`
- `ogImage`
- `contact`

`SECTIONS` keys currently include:

- `notices`
- `events`
- `resources`
- `projects`
- `grievance`
- `contact`

### Notice contract

Shape used by `src/data/notices.js`:

```js
{
  id: string,
  title: string,
  category: 'academic' | 'administrative' | 'urgent' | 'general',
  date: 'YYYY-MM-DD',
  description: string,
  attachmentUrl: string | null,
  pinned: boolean,
}
```

Behavior:

- Pinned notices sort above the rest.
- Remaining notices sort newest-first by date.
- Notices page supports category filtering.

### Event contract

Shape used by `src/data/events.js`:

```js
{
  id: string,
  title: string,
  date: 'YYYY-MM-DD',
  endDate: 'YYYY-MM-DD' | null,
  venue: string,
  description: string,
  image: string | null,
  category: 'workshop' | 'fest' | 'seminar' | 'competition' | 'cultural' | 'general',
  time: string | null,
  registrationUrl: string | null,
  instagramUrl: string | null,
  hideDate: boolean,
}
```

Behavior:

- Upcoming vs past is derived from the date automatically.
- `hideDate` is used to suppress the calendar icon/date block.
- Multi-day events can use `endDate`.

### Resource contract

Shape used by `src/data/resources.js`:

```js
{
  id: string,
  title: string,
  description: string,
  category: string,
  fileType: 'notes' | 'question-paper' | 'answer-key' | 'formula' | 'video' | 'pdf' | 'doc' | 'xls' | 'ppt' | 'img' | 'zip' | 'link',
  driveLink: string,
  addedDate: 'YYYY-MM-DD',
  moduleTitle?: string,
}
```

Resource page behavior:

- Semesters are inferred from the content text using `S2`, `S3`, `S4`, `S6`, etc.
- Resources are grouped by semester and then by module.
- The page uses file-type metadata to choose icon and color.

Current validator expectations:

- S2 count: 27
- S4 count: 21
- S3 should include expected module families around AI & DS, Transducers & Measurements, and Logic Circuit Design
- S6 should include expected module families around Power Electronics, Industrial Economics, DSP, and Process Dynamics & Control

### Project contract

Shape used by `src/data/projects.js`:

```js
{
  id: string,
  title: string,
  creators: string[],
  github: string,
  image: string,
  description: string,
  tags: string[],
}
```

### Faculty contract

Shape used by `src/data/faculty.js`:

```js
{
  id: string,
  name: string,
  designation: string,
  department: string,
  email: string,
  phone?: string | null,
  photoUrl?: string | null,
  role: 'coordinator' | 'advisor' | 'faculty' | 'student-rep',
}
```

## 6. Pages And Responsibilities

### `src/pages/Home.jsx`

Landing page with:

- Hero component swap between `HeroLightBlue` and `HeroNavyAmber`
- Quick-link grid to core sections
- Latest notices preview
- Upcoming events preview
- About preview and calls to action

### `src/pages/About.jsx`

- Department overview
- Milestones and history
- Faculty information

### `src/pages/Notices.jsx`

- Filterable notice board
- Pinned notices block
- Expand/collapse long descriptions
- Attachment links

### `src/pages/Events.jsx`

- Upcoming and past tabs
- Cards with images, registration, Instagram, and category badges
- Uses date utilities to determine visibility and freshness

### `src/pages/Resources.jsx`

- Search and filter resources
- Groups by semester and module
- Uses several resource-type icons and sorting heuristics

### `src/pages/Projects.jsx`

- Showcase grid of student projects
- Reuses `ProjectShowcaseCard`

### `src/pages/Contact.jsx`

- Contact card grid
- Optional map embed
- Role-based colors and avatar initials

### `src/pages/Grievance.jsx`

- Google Form embed using `SITE_CONFIG.grievanceFormUrl`

### `src/pages/NotFound.jsx`

- 404 fallback with navigation back to the site

## 7. Utilities And Validation

### Date helpers: `src/utils/date.js`

Used across notices and events for date formatting and temporal logic.

### General helpers: `src/utils/helpers.js`

Contains small shared helpers such as initials and string formatting.

### Dev config validation: `src/utils/validate-config.js`

Runs only in development from `src/main.jsx`.

Checks:

- Required site config fields
- Placeholder grievance URL
- At least one social link
- Theme color hex formatting
- Disabled sections warning

### Resource validation script: `scripts/validate-resources.mjs`

Run with `npm run validate:resources`.

Checks:

- Required resource fields
- Unique IDs
- Allowed file types
- Date format
- HTTP(S) link shape
- Semester counts and module family expectations

### Config validation script: `scripts/validate-config.mjs`

Run with `npm run validate:config`.

Checks:

- Site config required fields
- Email validity
- Hex colors
- Grievance URL placeholder
- Disabled sections warning

## 8. Styling System

Primary styling source: `src/index.css`

Tailwind config: `tailwind.config.js`

Design direction:

- Deep layered blues for background and surfaces
- Sky blue as the primary brand accent
- Amber reserved for emphasis and calls to action
- Plus Jakarta Sans for headings
- DM Sans for body copy

Core utility classes defined in CSS:

- `.section-container`
- `.section-padding`
- `.section-title`
- `.section-subtitle`
- `.card`
- `.btn-primary`
- `.btn-secondary`
- `.btn-accent`
- `.badge-*`

The design system is tokenized with CSS custom properties, so component styles should follow the existing tokens instead of hardcoding new colors.

## 9. Scripts, Build, And Deployment

### `package.json` scripts

- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run validate:config`
- `npm run validate:resources`
- `npm run firebase:sync`
- `npm run firebase:sync:text`

### GitHub Actions

Workflow: `.github/workflows/deploy.yml`

Current CI order:

1. Checkout
2. Setup Node 18
3. `npm ci`
4. `npm run validate:config`
5. `npm run validate:resources`
6. `npm run build`

### Deployment

- Vercel serves the app.
- `vercel.json` already routes all paths to `/index.html` so browser-history routing works.
- Production deploys trigger from `main`.

## 10. Content And Asset Locations

Static assets:

- `public/images/` for committed images
- `src/assets/` for imported assets if needed

Repository notes:

- Many event/project images currently reference paths under `public/images/events/`.
- `src/config/firebase.js` contains the frontend Firebase config used by analytics and optional sync-related flows.

## 11. Current Repo State To Keep In Mind

- The router is browser-history based now, not hash-based.
- `projects` is currently disabled in `SECTIONS`, so its route exists but the navigation is hidden unless that toggle is turned on.
- Resource validation currently expects S2 = 27 and S4 = 21.
- CI now runs both config and resource validation before build.

## 12. Pitfalls And Constraints

1. Keep all content dates in `YYYY-MM-DD` format.
2. Update `SECTIONS` only if you intend to hide or show a feature everywhere.
3. If you add a new route, update `src/App.jsx`, `src/config/navigation.js`, and likely `src/data/site-config.js`.
4. If you add a new content dataset, create a matching validation or at least a schema comment.
5. Keep external links HTTPS and use `target="_blank"` only when appropriate.
6. Resource data is tightly coupled to semester/module naming; changing the curriculum may require updating the validator logic.
7. Firebase sync is optional and requires separate credentials; it should not be assumed in local development.

## 13. Feature Integration Map

### If you add a new major section

You will usually change:

- `src/data/site-config.js` -> add `SECTIONS.<feature>`
- `src/config/navigation.js` -> add nav link and toggle mapping
- `src/App.jsx` -> add lazy import and route
- `src/pages/<Feature>.jsx` -> create page
- `src/pages/Home.jsx` -> add quick-link card if relevant
- `src/utils/validate-config.js` and `scripts/validate-config.mjs` -> if config shape changes
- `MAINTENANCE.md` -> document how maintainers edit the new content source

### If you add a data-driven workflow

You will usually change:

- `src/data/<new-data>.js` -> source of truth
- `scripts/<new-validator>.mjs` -> keep data shape safe
- `src/pages/<page>.jsx` -> render and filter the data
- `src/components/ui/` -> add reusable presentation components if needed

### If you add a login/admin feature

You will need more than the current static architecture provides:

- a real auth state layer
- protected route logic
- possibly a backend or Firebase Auth flow
- a data write path that is not just build-time JS files

## 14. Recommended Read Order For A New LLM

If another model needs to understand the repo quickly, read these in order:

1. `src/App.jsx`
2. `src/data/site-config.js`
3. `src/config/navigation.js`
4. `src/components/layout/PageLayout.jsx`
5. `src/pages/Home.jsx`
6. `src/pages/Notices.jsx`
7. `src/pages/Events.jsx`
8. `src/pages/Resources.jsx`
9. `src/pages/Projects.jsx`
10. `src/pages/Contact.jsx`
11. `scripts/validate-config.mjs`
12. `scripts/validate-resources.mjs`
13. `MAINTENANCE.md`

That sequence gives the fastest understanding of the app shape, content model, and the operational rules.
