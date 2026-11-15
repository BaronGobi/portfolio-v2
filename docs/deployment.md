# Deployment

The site is a standard Next.js 16 app. It is set up for Vercel, and also runs on any host that supports Node.js.

## Vercel

1. Push the repository to GitHub.
2. In Vercel, choose **Add New → Project** and import the repository.
3. Keep the detected settings (Framework: Next.js, Build command: `next build`).
4. Deploy.

Every push to the main branch deploys to production. Every pull request gets its own preview URL.

### Site URL

The site needs to know its public address for canonical links, the sitemap, `robots.txt` and social cards. It is resolved in this order (see `src/content/site.ts`):

1. `NEXT_PUBLIC_SITE_URL`, if set
2. Vercel's production domain (`VERCEL_PROJECT_PRODUCTION_URL`), which Vercel sets for you
3. `http://localhost:3000`

On Vercel you normally don't need to set anything. Set `NEXT_PUBLIC_SITE_URL` (for example `https://example.com`, no trailing slash) under **Settings → Environment Variables** if you want a specific domain used, then redeploy.

### Custom domain

Add the domain under **Settings → Domains** and follow Vercel's DNS instructions.

## Other hosts

```bash
npm ci
npm run build
npm run start      # serves on port 3000
```

Requirements: Node.js 20.9 or newer. Set `NEXT_PUBLIC_SITE_URL` to the public address before building.

The site uses Next.js image optimization and prerendering with streaming, so it needs a Node.js server. It is not configured for static export (GitHub Pages).

## Before you deploy

```bash
npm run lint
npm run typecheck
npm run build
```

The same three checks run in GitHub Actions on every push and pull request (`.github/workflows/ci.yml`).

## After you deploy

- Open `/sitemap.xml` and `/robots.txt` and confirm they show the real domain.
- Paste the URL into a social-card checker (for example LinkedIn's Post Inspector) to see the preview image.
- Run Lighthouse on the home page from Chrome DevTools.

## Known behavior

**Unknown project URLs return HTTP 200.** A URL such as `/work/does-not-exist` shows the 404 page, but with status 200 and a `noindex` tag. Next.js 16 starts streaming the page shell before it knows the project is missing, and the status can't change after that. Search engines respect `noindex`, so these pages are not indexed. Any other unknown URL returns a normal 404.
