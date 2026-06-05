# AEI Website Maintenance Manual

Audience: Maintainers who update content, keep deployments healthy, and run optional Firebase sync.

Last reviewed: 2026-06-03

## 1. Operating Model

This repository is a static-content-first site.

1. Public pages read from `src/data/*.js` at build time.
2. There is no live admin dashboard or runtime CMS in production flow.
3. Content changes are made in git, then deployed on Vercel.
4. Firebase is optional and used for analytics in the frontend plus an optional content/assets sync pipeline.

Key idea: the git repository is the source of truth.

## 2. Where To Maintain Content

Primary files:

- `src/data/site-config.js` (branding, contact info, grievance URL, section toggles)
- `src/data/about.js`
- `src/data/notices.js`
- `src/data/events.js`
- `src/data/resources.js`
- `src/data/projects.js`
- `src/data/faculty.js`
- `src/data/mock-tests.js` (mock test catalog and questions)

### 5.7 Mock Tests (`src/data/mock-tests.js`)

Expected fields per test:

- `id`, `title`, `subject`, `scheme`, `semester`, `difficulty`, `startDate`, `durationMinutes`, `totalMarks`, `questions`
- Optional: `endDate`

Expected fields per question:

- `id`, `type`, `question`, `options`, `correctAnswer`
- Optional: `explanation`

Important validator behavior (`scripts/validate-mock-tests.mjs`):

1. Checks required fields, string IDs, and duplicate test IDs.
2. Validates integer time limits and mark totals.
3. Enforces a non-empty questions array.
4. Validates each question's option list and correct answer index.

If the mock test schema changes, update the validator and CI workflow in the same PR.

Operational files:

- `.github/workflows/deploy.yml` (optional CI build checks)
- `package.json` (scripts)
- `scripts/validate-resources.mjs` (resource quality checks)
- `scripts/firebase/sync-content.mjs` (optional Firebase sync)

## 3. Pre-Change Checklist

Run before making edits:

1. Pull latest changes.
2. Confirm you are on the intended branch.
3. Verify Node is available (`node -v`) and dependencies are installed (`npm install` once).
4. Skim open content PRs to avoid duplicate edits.

## 4. Daily Maintenance SOP

1. Update content in `src/data/*.js`.
2. Run local checks:

```bash
npm run validate:config
npm run validate:resources
npm run build
```

3. Preview quickly with `npm run preview` if the change is visual.
4. Commit with a clear message.
5. Push to `main` (or merge to `main`) and watch Vercel deployment.
6. Verify production pages after deploy.

## 5. Content-Specific Rules

### 5.1 Notices (`src/data/notices.js`)

Expected fields per item:

- `id`
- `title`
- `category` (`academic`, `administrative`, `urgent`, `general`)
- `date` (`YYYY-MM-DD`)
- `description`
- `attachmentUrl` (`string` or `null`)
- `pinned` (`boolean`)

Operational notes:

1. Keep `id` stable once published.
2. Keep `date` valid; sorting is by date.
3. Use `pinned` sparingly (top-priority announcements only).

### 5.2 Events (`src/data/events.js`)

Expected fields per item:

- `id`, `title`, `date`, `venue`, `description`, `category`
- Optional: `endDate`, `image`, `time`, `registrationUrl`, `instagramUrl`, `hideDate`

Operational notes:

1. Use `YYYY-MM-DD` for `date` and `endDate`.
2. Upcoming vs past is automatic based on `date`; do not add status fields.
3. If `image` is used, prefer `/images/events/...` under `public/images`.

### 5.3 Resources (`src/data/resources.js`)

Expected fields per item:

- `id`, `title`, `description`, `category`, `fileType`, `driveLink`, `addedDate`
- Optional but used for grouping quality: `moduleTitle`

Important validator behavior (`scripts/validate-resources.mjs`):

1. Checks required fields, unique IDs, URL/date formats, and allowed `fileType` values.
2. Enforces specific dataset coverage rules (for current academic setup), including:
   - S2 record count
   - S4 record count
   - Presence of expected S3 and S6 module families

If this validator fails after intentional curriculum changes, update the validator logic in the same PR.

### 5.4 Projects (`src/data/projects.js`)

Expected fields:

- `id`, `title`, `creators` (array), `github`, `image`, `description`, `tags` (array)

Operational notes:

1. Use real public repository links.
2. Keep descriptions concise and technical.
3. Keep image paths valid.

### 5.5 Contact Cards (`src/data/faculty.js`)

Expected fields:

- `id`, `name`, `designation`, `department`, `email`, `role`
- Optional: `phone`, `photoUrl`

Role order on page is controlled by `Contact.jsx`:

- `coordinator`
- `advisor`
- `faculty`
- `student-rep`

### 5.6 Global Config (`src/data/site-config.js`)

High-impact fields:

1. `grievanceFormUrl` (used directly in iframe and external link).
2. `socialLinks` (empty strings hide links).
3. `themeColors` (branding consistency).
4. `contact` block (shown in UI and metadata).
5. `SECTIONS` toggles (controls routes/navigation visibility).

If a section is set to `false`, routes and nav links for that section disappear.

## 6. Deployment Operations

This site is hosted on Vercel.

Primary deploy flow:

1. Push to GitHub
2. Vercel builds the commit (`npm run build`)
3. Vercel publishes production from the configured production branch

If GitHub Actions is used in this repo, treat it as CI checks only unless explicitly wired to Vercel deployment.

Local deployment readiness commands:

```bash
npm install
npm run validate:resources
npm run build
```

## 7. Optional Firebase Sync Operations

Use only when you want to mirror local content and images to Firebase.

Docs: `scripts/firebase/README.md`

### 7.1 Required Environment

Credentials (one method):

- `FIREBASE_SERVICE_ACCOUNT_PATH`
- or `FIREBASE_SERVICE_ACCOUNT_JSON`
- or `GOOGLE_APPLICATION_CREDENTIALS`

Recommended:

- `FIREBASE_PROJECT_ID`
- `FIREBASE_STORAGE_BUCKET`

Optional:

- `FIREBASE_ASSET_PREFIX` (default `site-assets/images`)

### 7.2 Commands

```bash
# Text + image assets
npm run firebase:sync

# Text only
npm run firebase:sync:text
```

### 7.3 Sync Semantics

1. Text datasets from `src/data` are written to Firestore collection `content`.
2. Image files under `public/images` are uploaded to Firebase Storage.
3. Asset manifest docs are written under Firestore collection `assets`.
4. Stale Firestore records/manifests are removed.
5. Remote storage objects are not deleted by stale-manifest cleanup.

## 8. Backup And Recovery

### 8.1 What to Back Up

1. Git repository history (content source of truth).
2. Key external links referenced in data (Drive URLs, forms).
3. Firebase service account key handling process (not in repo).

### 8.2 Fast Recovery

If production content is wrong after a change:

1. Identify last known good commit.
2. Revert content files only (avoid broad rollback if unnecessary).
3. Push fix and wait for Vercel redeploy.

If Firebase sync caused unintended data shape:

1. Correct local `src/data` first.
2. Re-run sync with corrected source.
3. Verify Firestore `content` and `assets` docs.

## 9. Incident Playbooks

### 9.1 Site Not Updating After Push

Checks:

1. Confirm push reached `main`.
2. Check latest deployment in Vercel dashboard.
3. Confirm build step succeeded.
4. Hard refresh browser after deploy completes.

### 9.2 Build Fails

Checks:

1. Run `npm run build` locally and read first error.
2. Validate modified data file syntax (missing commas/quotes are common).
3. Run `npm run validate:resources` for resource-related failures.

### 9.3 Resources Page Looks Incomplete

Checks:

1. Verify `category` and `description/moduleTitle` include semester/module signals.
2. Verify `fileType` is in allowed set used by validator and UI mapping.
3. Verify `addedDate` format is `YYYY-MM-DD`.

### 9.4 Event Image Not Displaying

Checks:

1. Verify file exists under `public/images/...`.
2. Verify path starts with `/images/...`.
3. Verify extension is valid and filename casing matches exactly.

### 9.5 Grievance Form Not Loading

Checks:

1. Verify `SITE_CONFIG.grievanceFormUrl` in `src/data/site-config.js`.
2. Confirm Google Form sharing/embedding permissions.
3. Confirm URL works standalone in a browser tab.

## 10. Scheduled Maintenance

### Weekly

1. Remove stale notices and outdated event links.
2. Validate newest resources and Drive permissions.
3. Run `npm run validate:resources` and `npm run build`.

### Monthly

1. Review `site-config.js` contact/social links.
2. Confirm footer year/branding text is current.
3. Check dependency updates (`npm outdated`) and evaluate upgrade PRs.
4. Confirm Vercel deployment health (recent deploys green).

### Per Semester Changeover

1. Revisit semester/module expectations in `scripts/validate-resources.mjs`.
2. Archive older notices/events as needed.
3. Seed new semester resources and verify grouping in UI.

## 11. Quick Command Reference

```bash
# local dev
npm run dev

# production build
npm run build

# preview production build
npm run preview

# config validation
npm run validate:config

# resource validations
npm run validate:resources

# firebase sync (optional)
npm run firebase:sync
npm run firebase:sync:text
```

## 12. Session Checklist

- [ ] Pulled latest `main`
- [ ] Updated correct `src/data` files
- [ ] Ran `npm run validate:resources`
- [ ] Ran `npm run build`
- [ ] Verified key pages locally (or preview)
- [ ] Pushed changes and confirmed Vercel deployment
- [ ] Spot-checked production
