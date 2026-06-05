# Deployment Guide — Vercel

Step-by-step guide to deploy the AEI Association website on Vercel.

---

## Prerequisites

- [x] Node.js installed (v18+)
- [x] Git installed
- [x] GitHub account
- [x] Vercel account
- [x] Content updates completed in `src/data/`

---

## Step 1: Push Code to GitHub

If your repo is already on GitHub, skip this step.

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: AEI Association website"

# Add remote origin (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/aei-association.git

# Push
git branch -M main
git push -u origin main
```

---

## Step 2: Import Project in Vercel

1. Go to [vercel.com](https://vercel.com) and sign in.
2. Click **Add New Project**.
3. Import your GitHub repository.
4. Confirm build settings:
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Click **Deploy**.

Your site will be published on a `*.vercel.app` URL.

---

## Step 3: Verify SPA Routing

This repo includes `vercel.json` with SPA fallback routing to `index.html`.

If deep links return 404, confirm `vercel.json` still contains:

```json
{
  "routes": [
    { "handle": "filesystem" },
    { "src": "/.*", "dest": "/index.html" }
  ]
}
```

---

## Step 4: Custom Domain (Optional)

1. Open your Vercel project.
2. Go to **Settings → Domains**.
3. Add your custom domain.
4. Add DNS records exactly as shown by Vercel.
5. Wait for verification and enable HTTPS.

---

## Updating the Site

After initial setup, deployment is automatic:

1. Edit content files (`src/data/*.js`)
2. Commit and push:

```bash
git add .
git commit -m "Update notices/events/resources"
git push
```

3. Vercel auto-builds and deploys the new commit.

---

## Troubleshooting

### Build failed on Vercel

- Run `npm run build` locally and fix the first error.
- Run `npm run validate:resources` for resource data issues.
- Redeploy from Vercel dashboard after fixing.

### Route 404 on direct URL

- Confirm `vercel.json` rewrite to `/index.html` is present.
- Redeploy after any routing config changes.

### Content not updating

- Confirm commit reached the connected production branch.
- Check deployment logs in Vercel dashboard.
- Hard refresh browser (`Ctrl+F5`).

---

## Need Help?

- Check [Vercel docs](https://vercel.com/docs)
- Open an issue in this repository
- Contact: studentassistassociation.aei@cet.ac.in

*Updated: 2026-06-03*
