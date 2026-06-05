
# AEI Association — AEI, CET

A modern, mobile-first static website for the Applied Electronics and Instrumentation (AEI) department at College of Engineering Trivandrum. Built with React, Vite, and Tailwind CSS. Zero backend — all content driven by simple JavaScript data files.

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or later)
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/aei-association.git
cd aei-association

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

---

## 📁 Project Structure

```
aei-association/
├── public/
│   └── images/              # Gallery photos, event images
├── src/
│   ├── assets/              # Logos, static images
│   │   └── gallery/         # Gallery images (if stored locally)
│   ├── components/          # Reusable UI components
│   │   ├── Layout.jsx
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── SectionHeader.jsx
│   │   ├── LoadingSpinner.jsx
│   │   └── ScrollToTop.jsx
│   ├── data/                # ⭐ Content data files (EDIT THESE)
│   │   ├── site-config.js   # Global site settings
│   │   ├── about.js         # About section content
│   │   ├── notices.js       # Notice board entries
│   │   ├── events.js        # Event calendar
│   │   ├── gallery.js       # Photo gallery
│   │   ├── resources.js     # Downloadable resources
│   │   └── faculty.js       # Contact cards
│   ├── pages/               # Page components (one per route)
│   │   ├── Home.jsx
│   │   ├── About.jsx
│   │   ├── Notices.jsx
│   │   ├── Events.jsx
│   │   ├── Gallery.jsx
│   │   ├── Resources.jsx
│   │   ├── Grievance.jsx
│   │   ├── Contact.jsx
│   │   └── NotFound.jsx
│   ├── utils/               # Helper functions
│   │   ├── date.js
│   │   └── helpers.js
│   ├── App.jsx              # Main app + routing
│   ├── main.jsx             # Entry point
│   └── index.css            # Tailwind + global styles
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

---

## 📝 How to Update Content

**You only need to edit files in the `src/data/` folder.** No HTML or CSS knowledge required.

For full maintenance SOPs, check `MAINTENANCE.md`.

### Add a Notice

1. Open `src/data/notices.js`
2. Copy an existing notice block `{ ... },`
3. Paste it at the **top** of the list
4. Update the values (title, date, description, etc.)
5. Save → `git add .` → `git commit -m "add notice: title"` → `git push`
6. Push to `main` (or merge into `main`) and let GitHub Actions deploy automatically

### Add an Event

1. Open `src/data/events.js`
2. Add a new event object (see file comments for structure)
3. Save, commit, push to `main`

### Add a Gallery Photo

1. Upload the image to `public/images/`
2. Reference it in the relevant data file (for example, `src/data/events.js` or `src/data/projects.js`)
3. Save, commit, push to `main`

### Update Contact Info

1. Open `src/data/faculty.js`
2. Edit existing entries or add new ones
3. Save, commit, push to `main`

### Change Global Settings

Edit `src/data/site-config.js` to change:
- Site name, tagline, department/college names
- Social media links
- Theme colors
- Grievance form URL

### Mock Tests

The mock test system is auth-gated and data-driven:

- `src/data/mock-tests.js` defines the catalog, timing, and questions
- `src/pages/Login.jsx` handles sign-in / sign-up
- `src/pages/mock-tests/MockTestsList.jsx` lists tests
- `src/pages/mock-tests/TestEnvironment.jsx` runs the timed quiz flow
- `src/pages/mock-tests/TestResults.jsx` shows the score and answer breakdown
- `src/pages/admin/Dashboard.jsx` and `src/pages/admin/ManageTests.jsx` cover the admin flow

If you edit the schema, run `npm run validate:tests` before building.

## Mock Tests Enhancements

This project includes an integrated mock-tests experience with the following additions:

- UI components: `Timer` and `ProgressBar` (exported from `src/components/ui`). They provide a consistent timer display and visual progress for tests.
- Firestore-backed persistence: test submissions are stored in Firestore via `src/services/firestore-mock-tests.js` when a Firebase app is configured; otherwise submissions are saved to `localStorage` as a fallback.
- The quiz (`src/pages/mocktest/MockTestQuiz.jsx`) supports pausing/resuming the timer; submissions auto-save on completion or when time expires.

Notes:
- Ensure Firebase client config is available in environment for production persistence. See `src/config/firebase.js` for initialization details.

---

## 🎨 Design System

### Colors (Tailwind classes)

- **Primary:** `bg-primary-500`, `text-primary-600` — Main brand blue
- **Accent:** `bg-accent-500`, `text-accent-600` — Warm orange
- **Surface:** `bg-surface-50`, `bg-white` — Backgrounds
- **Text:** `text-text-primary`, `text-text-secondary`, `text-text-muted` — Text hierarchy

### Typography

- **Headings:** Plus Jakarta Sans (`.font-heading`)
- **Body:** DM Sans (`.font-body`)

### Key Components

- **Buttons:** `.btn-primary`, `.btn-secondary`, `.btn-accent`
- **Cards:** `.card` (auto shadow + hover effect)
- **Badges:** `.badge-primary`, `.badge-accent`, `.badge-muted`
- **Layout:** `.section-container` (max-width + padding), `.section-padding` (vertical padding)

---

## 🚢 Deployment

This site is hosted on **Vercel**.

### First-Time Setup

1. Create a new GitHub repository: `aei-association`
2. Push this code to the repo:

```bash
git remote add origin https://github.com/YOUR_USERNAME/aei-association.git
git branch -M main
git push -u origin main
```

3. Go to [Vercel](https://vercel.com), click **Add New Project**, and import your GitHub repository
4. Confirm build settings:
	- Framework Preset: `Vite`
	- Build Command: `npm run build`
	- Output Directory: `dist`
5. Click **Deploy**

### Deploy Flow

After initial setup, Vercel handles deployments automatically:

1. Push commits to GitHub
2. Vercel builds and deploys the latest commit
3. Main branch updates production, other branches get preview URLs

Your site will be live at:

```
https://YOUR-PROJECT.vercel.app
```

### Custom Domain (Optional)

1. Open your project in Vercel → **Settings** → **Domains**
2. Add your domain (e.g., `assistassociation.aei.cet.ac.in`)
3. Configure DNS records as instructed by Vercel
4. Keep `base: '/'` in `vite.config.js`
5. Redeploy from Vercel dashboard (or push a new commit)

---

## 🛠️ Tech Stack

- **React 18** — UI library
- **Vite** — Lightning-fast build tool
- **Tailwind CSS** — Utility-first CSS framework
- **React Router** — Client-side routing
- **Framer Motion** — Smooth animations
- **Lucide React** — Beautiful open-source icons
- **Vercel** — Hosting and deployment platform

---

## 📦 Available Scripts

| Command          | Description                                    |
|------------------|------------------------------------------------|
| `npm run dev`    | Start development server (port 5173)           |
| `npm run build`  | Build for production in `dist/`                |
| `npm run preview`| Preview production build locally               |
| `npm run validate:tests` | Validate mock tests dataset and schema rules |
| `npm run validate:resources` | Validate `src/data/resources.js` dataset rules |
| `npm run firebase:sync` | Sync content + images to Firebase (optional) |
| `npm run firebase:sync:text` | Sync content only to Firebase (optional) |

---

## 🔧 Troubleshooting

### "Page not found" on Vercel

- Confirm `vercel.json` includes SPA fallback to `/index.html`
- Make sure `base` in `vite.config.js` is `/`
- Redeploy the latest commit from the Vercel dashboard

### Images not loading

- If using local images, place them in `src/assets/` or `public/images/`
- If using Google Drive, ensure the link is a direct link: `https://drive.google.com/uc?export=view&id=FILE_ID`
- Use `loading="lazy"` attribute for better performance

### Changes not showing up

- Hard refresh: `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)
- Clear browser cache
- Check latest deployment status in Vercel dashboard

---

## 🤝 Contributing

This site is maintained by the AEI Association team. If you're a student or faculty member:

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m "Add feature"`
4. Push: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is open-source and available under the MIT License.

---

## 📞 Support

For questions, issues, or suggestions:
- Open an issue on GitHub
- Email: studentassistassociation.aei@cet.ac.in
- Visit the Contact page on the live site

---

**Built with ❤️ by the AEI Association team**

*Last updated: 2026-06-03*
