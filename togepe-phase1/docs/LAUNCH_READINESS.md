# Pinitup Launch Readiness

> Generated from a full audit of the repository on 2026-07-22.
> Every claim below is backed by a specific file path. No features are invented.

---

## Tech Stack

| Layer | Technology | Details |
|---|---|---|
| **Frontend** | React 18, Vite 5, JavaScript (JSX) | No TypeScript. No TailwindCSS. Inline styles + CSS files. `client/package.json` |
| **Backend** | Node.js, Express 4, ESM modules | `"type": "module"` in `server/package.json` |
| **Database** | MongoDB Atlas, Mongoose 8 | `server/config/db.js`, `server/models/` |
| **Authentication** | JWT (7-day expiry) + Passport.js (Google OAuth 2.0) | `server/middleware/authMiddleware.js`, `server/config/passport.js` |
| **Storage** | Cloudinary (image uploads via Multer) | `server/config/cloudinary.js`, `server/middleware/uploadMiddleware.js` |
| **Deployment** | Vercel (client) + Render (server) | `client/vercel.json` (SPA rewrite). No `render.yaml` exists. |

---

## Third-party Services

### 1. MongoDB Atlas
- **Purpose:** Primary database for all models (User, Content, Board, Like)
- **Configured in:** `server/config/db.js:5` (`process.env.MONGO_URI`)
- **Required env vars:** `MONGO_URI`
- **Connection string in repo:** `mongodb+srv://dev_db_user:4P3TZIwY3gWwqxip@cluster0.ldaqfni.mongodb.net/Pinitup` (in `server/.env`)
- **Production ready:** Needs manual verification — confirm Atlas cluster is accessible from Render's IP range and has proper indexing

### 2. Cloudinary
- **Purpose:** Image storage and CDN for uploaded prompt images
- **Configured in:** `server/config/cloudinary.js:11-13`
- **Required env vars:** `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- **Production ready:** Needs manual verification — confirm plan limits and signed URLs

### 3. Google OAuth 2.0
- **Purpose:** Social login (Google sign-in)
- **Configured in:** `server/config/passport.js:17-19`
- **Required env vars:** `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`
- **Callback URL:** Must be set in Google Cloud Console to `https://<backend-url>/api/auth/google/callback`
- **Production ready:** Needs manual verification — confirm OAuth consent screen is published, redirect URI matches

### 4. Vercel
- **Purpose:** Frontend hosting and CDN
- **Configured in:** `client/vercel.json` (SPA rewrite rule)
- **Build command:** `npm run build` (auto-detected from `client/package.json`)
- **Output dir:** `dist/` (Vite default)
- **Required env vars:** `VITE_API_URL` (must be set per environment)
- **Production ready:** Needs manual verification — confirm custom domain, env vars, build logs

### 5. Render
- **Purpose:** Backend API hosting
- **Configured in:** No `render.yaml` — manually configured
- **Start command:** `npm start` → `node server.js` (`server/package.json`)
- **Required env vars:** All 11 backend env vars (see Environment Variables section)
- **Production ready:** Needs manual verification — confirm service is running, env vars set, no free-tier sleep issues

### 6. Domain (pinitup.io / www.pinitup.io)
- **Purpose:** Production frontend URL
- **Referenced in:** `server/.env` (`CLIENT_URL` includes `https://www.pinitup.io,https://pinitup.io`)
- **Production ready:** Needs manual verification — confirm DNS records, SSL, Vercel domain assignment

---

## Environment Variables

### Backend (11 variables)

All referenced via `process.env` in the server codebase:

| Variable | Where Referenced | Purpose |
|---|---|---|
| `MONGO_URI` | `server/config/db.js:5`, `server/seedAdmin.js:19` | MongoDB connection string |
| `JWT_SECRET` | `server/server.js:46`, `server/middleware/authMiddleware.js:13`, `server/middleware/optionalAuth.js:19`, `server/controllers/authController.js:8` | JWT signing secret |
| `PORT` | `server/server.js:63` | Server port (fallback: 5000) |
| `CLIENT_URL` | `server/server.js:23` | Comma-separated CORS origins |
| `FRONTEND_URL` | `server/controllers/authController.js:58`, `server/routes/authRoutes.js:22,26` | Single origin for OAuth redirects |
| `CLOUDINARY_CLOUD_NAME` | `server/config/cloudinary.js:11` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | `server/config/cloudinary.js:12` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | `server/config/cloudinary.js:13` | Cloudinary API secret |
| `GOOGLE_CLIENT_ID` | `server/config/passport.js:17` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | `server/config/passport.js:18` | Google OAuth client secret |
| `GOOGLE_CALLBACK_URL` | `server/config/passport.js:19` | Google OAuth callback URL |

**Current local `.env` values** (`server/.env`): Contains production MongoDB URI, Cloudinary keys, Google OAuth credentials, and JWT secret. This file must NOT be committed (`.gitignore` covers `*.env`).

### Frontend (1 variable)

| Variable | Where Referenced | Purpose |
|---|---|---|
| `VITE_API_URL` | `client/src/services/api.js:3`, `client/src/pages/LoginPage.jsx:38` | Backend API base URL |

**Current values:**
- `client/.env`: `http://localhost:5001/api` (local dev)
- `client/.env.production`: `https://pinitup-gsu9.onrender.com/api` (production)

---

## Current Features

Based on actual routes, controllers, pages, and components in the repository:

### Authentication
- Email/password registration and login (`POST /api/auth/register`, `POST /api/auth/login`)
- Google OAuth sign-in (`GET /api/auth/google`, `GET /api/auth/google/callback`)
- JWT tokens stored in localStorage, set via Axios interceptor
- Auto-logout on 401 responses
- Files: `server/controllers/authController.js`, `server/routes/authRoutes.js`, `client/src/context/AuthContext.jsx`, `client/src/pages/LoginPage.jsx`, `client/src/pages/OAuthSuccess.jsx`

### Feed (Homepage)
- Masonry grid (CSS `column-count`: 5→4→3→2 columns responsive)
- Image category strip with thumbnail cards
- Demo content (48 prompts) as fallback when API is empty
- Server-first data flow with client-side demo padding
- Files: `client/src/pages/Feed.jsx`, `client/src/pages/Feed.css`, `client/src/components/feed/PromptCard.jsx`, `client/src/data/demoPrompts.js`

### Prompt CRUD
- Create: image upload + title, description, prompt text, tags, category (`POST /api/content`)
- Read: list with search/filter/sort/pagination (`GET /api/content`), single (`GET /api/content/:id`)
- Delete: owner-only (`DELETE /api/content/:id`)
- **No update/edit feature exists**
- Files: `server/controllers/contentController.js`, `client/src/pages/AddPromptPage.jsx`, `client/src/pages/PromptDetail.jsx`

### Boards (Collections)
- Full CRUD: create, list, get, update, delete boards
- Save/unsave prompts to boards with duplicate prevention
- `GET /api/boards/saved-ids` — returns all saved content IDs for current user
- `?contentId=X` query param returns `isSaved` boolean per board
- Files: `server/controllers/boardController.js`, `server/routes/boardRoutes.js`, `client/src/pages/Boards.jsx`, `client/src/pages/BoardDetail.jsx`, `client/src/components/board/SaveToBoardModal.jsx`

### Likes
- Toggle like/unlike with optimistic UI updates
- `likesCount` recalculated from actual Like documents (self-heals drift)
- Spring animation on LikeButton
- Files: `server/controllers/likeController.js`, `server/routes/likeRoutes.js`, `client/src/components/shared/LikeButton.jsx`

### Search & Filters
- Server-side search via regex on title, description, prompt, tags (case-insensitive)
- Category filter via `?category=`
- Sort: `newest`, `oldest`, `popular` (by likesCount), `most_saved` (Board aggregation)
- Debounced search input (400ms)
- URL-based filter state via `useSearchParams`
- Categories fetched from `GET /api/content/categories`
- Files: `server/controllers/contentController.js`, `client/src/pages/Feed.jsx`

### Sharing
- Web Share API (mobile) with clipboard fallback (desktop)
- Share URL: `{origin}/prompt/{id}`
- `sharesCount` field exists on Content model but is **never incremented** — share is client-side only
- Files: `client/src/utils/sharePrompt.js`

### Admin Dashboard
- Stats: total users, total prompts, total boards
- Recent activity (last 5 prompts)
- Admin-only route (`/admin`) with `AdminRoute` guard
- Admin email whitelist for Google OAuth auto-promotion
- Files: `server/controllers/adminController.js`, `server/routes/adminRoutes.js`, `client/src/pages/AdminPage.jsx`

### Guest Browsing
- Guests see up to 5 prompts without authentication
- Server-side cap in `contentController.js` (no pagination for guests)
- `GuestFeedCTA` component shown after 5th prompt
- Like/save buttons hidden for guests
- Files: `server/controllers/contentController.js`, `client/src/components/feed/GuestFeedCTA.jsx`

### Responsive Navbar
- Desktop: logo, search bar, nav links, notifications, profile, sign out
- Tablet (768–1024px): reduced spacing
- Mobile (<768px): logo, search icon, hamburger menu with slide-out drawer
- Drawer contains: Explore, Dashboard, Boards, Create, Profile, Admin, Sign out
- Files: `client/src/components/layout/Navbar.jsx`, `client/src/components/layout/Navbar.css`

### Dashboard
- Welcome section with time-of-day greeting
- Stats grid (4 cards)
- Recent prompts (last 6)
- Trending prompts (top 5 by likes)
- Quick actions (4 cards)
- Files: `client/src/pages/Dashboard.jsx`, `client/src/components/dashboard/`

### UI/UX
- White minimal PromptPin-inspired theme
- Pinterest-style masonry layout
- Framer Motion animations
- ErrorBoundary, Toast, TagInput reusable components
- Dark hover overlays on prompt cards
- Files: `client/src/components/shared/Toast.jsx`, `client/src/components/shared/ErrorBoundary.jsx`, `client/src/components/shared/TagInput.jsx`

---

## Access Checklist

Pre-launch accounts/services that should be verified:

| Service | Purpose | What to Verify |
|---|---|---|
| **GitHub** | Source code hosting | Repository is pushed, collaborators have access |
| **Vercel** | Frontend deployment | Project linked to `client/` directory, `VITE_API_URL` set in env vars (Production + Preview), custom domain configured |
| **Render** | Backend deployment | Service linked to `server/` directory, all 11 env vars set, no free-tier sleep (upgrade if on free) |
| **MongoDB Atlas** | Database | Cluster is accessible from Render, database `Pinitup` exists, IP whitelist includes Render IPs (or is set to 0.0.0.0/0) |
| **Google Cloud Console** | OAuth | OAuth consent screen published, redirect URI set to `https://<render-url>/api/auth/google/callback`, client ID/secret match Render env vars |
| **Cloudinary** | Image storage | Cloud name, API key, API secret match Render env vars, upload presets if any |
| **Domain DNS** | Custom domain | `pinitup.io` and `www.pinitup.io` point to Vercel, SSL certificates active |

---

## Deployment Checklist

### Backend (Render)
- [ ] `MONGO_URI` — production MongoDB connection string
- [ ] `JWT_SECRET` — strong random secret (not the dev value `8qwQdTih0aHtyCUEDqeq4ZTFiiYXJYZiidNqmDiFItf`)
- [ ] `PORT` — Render sets this automatically
- [ ] `CLIENT_URL` — `https://www.pinitup.io,https://pinitup.io,https://pinitup-ten.vercel.app,http://localhost:5173`
- [ ] `FRONTEND_URL` — `https://www.pinitup.io`
- [ ] `CLOUDINARY_CLOUD_NAME` — production value
- [ ] `CLOUDINARY_API_KEY` — production value
- [ ] `CLOUDINARY_API_SECRET` — production value
- [ ] `GOOGLE_CLIENT_ID` — production value
- [ ] `GOOGLE_CLIENT_SECRET` — production value
- [ ] `GOOGLE_CALLBACK_URL` — `https://<render-url>/api/auth/google/callback`
- [ ] Start command: `npm start` (or `node server.js`)
- [ ] Build command: (none needed — plain Node.js)

### Frontend (Vercel)
- [ ] `VITE_API_URL` — `https://<render-url>/api` (set in Vercel dashboard, not in `.env.production`)
- [ ] Build command: `npm run build` (auto-detected)
- [ ] Output directory: `dist/` (auto-detected)
- [ ] Install command: `npm install` (auto-detected)
- [ ] SPA rewrite: handled by `client/vercel.json` (`/(.*) → /index.html`)

### Google Cloud Console
- [ ] OAuth redirect URI: `https://<render-url>/api/auth/google/callback`
- [ ] Authorized JavaScript origins: `https://www.pinitup.io`, `https://pinitup.io`
- [ ] OAuth consent screen: published (not testing mode)

### Domain
- [ ] DNS A record or CNAME for `pinitup.io` → Vercel
- [ ] DNS CNAME for `www.pinitup.io` → Vercel
- [ ] SSL/TLS active on both domains

---

## Known Risks

### Critical

1. **Dev secrets in `server/.env` committed to git history** — The file `.gitignore` covers `*.env`, but `server/.env` contains production MongoDB URI, Cloudinary API keys, Google OAuth secrets, and JWT secret. Even if currently gitignored, these values may exist in git history if they were ever committed. **Rotate all credentials before launch.**

2. **No `render.yaml` or infrastructure-as-code** — Backend deployment is manually configured on Render. No way to reproduce the deployment from the repo alone.

3. **No CI/CD pipeline** — No `.github/workflows/` directory. No automated tests, linting, or build verification on push/PR.

4. **JWT secret hardcoded in fallback** — `server/server.js:46` falls back to `"pinitup-session-secret"` if `JWT_SECRET` is not set. This is insecure in production.

### High

5. **`VITE_API_URL` set in `.env.production` with a specific Render URL** — If the Render service URL changes, the committed `.env.production` becomes stale. Vercel dashboard env vars should override this, but this needs verification.

6. **`FRONTEND_URL` set to `http://localhost:5173` in `server/.env`** — This is the local dev value. Production Render must override with `https://www.pinitup.io`.

7. **No rate limiting** — No `express-rate-limit` or similar middleware. API endpoints are vulnerable to brute-force attacks (login, registration).

8. **No request body size limiting** — `express.json()` has no `limit` option set. Default is 100KB, but should be explicitly configured.

9. **`session` cookie has no `secure` flag** — `server/server.js:44-48` uses `session()` without `secure: true` or `sameSite` configuration.

10. **No HTTPS enforcement** — No redirect from HTTP to HTTPS on the backend (Render may handle this, but not verified).

### Medium

11. **6 of 8 doc files are empty templates** — `Architecture.md`, `API.md`, `Database.md`, `Design.md`, `PRD.md`, `Phases.md`, `Rules.md` contain only prompt templates, not actual documentation. Only `Memory.md` and `Founder-Decisions.md` have real content.

12. **`sharesCount` never incremented** — The field exists on the Content model (`server/models/Content.js`) but the share feature is client-side only (clipboard/Web Share API). The count is never written.

13. **No edit content feature** — Users can create and delete prompts, but cannot edit them after creation.

14. **No `/profile` or `/settings` pages** — Routes exist in `App.jsx` but `/profile` reuses Dashboard and `/settings` does not exist (404 redirect to `/`).

15. **Landing page branding says "PromptPin"** — `client/src/pages/LandingPage.jsx` references "PromptPin" instead of "Pinitup". This page is not currently routed (`/` renders Feed), but exists in the codebase.

16. **No monitoring or error tracking** — No Sentry, LogRocket, or similar. No structured logging on the backend (only `console.log`/`console.error`).

17. **No database backup strategy** — MongoDB Atlas may have automated backups depending on the plan. Needs manual verification.

18. **Package names still use "togepe"** — `client/package.json` is `togepe-client`, `server/package.json` is `togepe-server`. Cosmetic but inconsistent with "Pinitup" branding.

### Low

19. **Unused components** — `UserMenu.jsx`, `FeedToolbar.jsx`, `EmptyFeed.jsx`, `ErrorFeed.jsx` exist but are not imported/used by their parent pages.

20. **No `<meta>` SEO tags** — `client/index.html` likely has default Vite meta tags. No Open Graph, Twitter card, or structured data.

21. **No sitemap or robots.txt** — Not present in `client/public/`.

22. **Guest feed limit is hardcoded** — `GUEST_PROMPT_LIMIT = 5` in `Feed.jsx` and hardcoded `limit: 5` in `contentController.js`. Not configurable via env var.

---

## Pre-launch Checklist

### Code & Build
- [ ] `npm run build` passes in `client/` — ✅ Verified (builds successfully)
- [ ] No TypeScript errors — N/A (project uses JSX)
- [ ] No runtime errors on key flows (login, feed, upload, boards, admin)
- [ ] Mobile responsive navbar works on iOS Safari and Android Chrome
- [ ] Google OAuth flow completes end-to-end in production
- [ ] Image upload works with Cloudinary in production
- [ ] Guest browsing shows 5 prompts and CTA
- [ ] Search, filter, and sort work on production

### Security
- [ ] All `server/.env` secrets rotated (not the dev values)
- [ ] `JWT_SECRET` is a strong random string (not `8qwQdTih0aHtyCUEDqeq4ZTFiiYXJYZiidNqmDiFItf`)
- [ ] `CLIENT_URL` in Render does not include `http://localhost:5173` (or it doesn't matter since CORS only checks against the list)
- [ ] `FRONTEND_URL` in Render is `https://www.pinitup.io` (not localhost)
- [ ] Google OAuth redirect URI matches exactly in Google Cloud Console and Render
- [ ] MongoDB Atlas IP whitelist allows Render outbound IPs
- [ ] Cloudinary upload presets are restricted (if applicable)

### Infrastructure
- [ ] Vercel project linked to correct GitHub repo and `client/` directory
- [ ] Render service linked to correct GitHub repo and `server/` directory
- [ ] Custom domain `pinitup.io` verified in Vercel
- [ ] `www.pinitup.io` redirects to `pinitup.io` (or vice versa — choose one canonical)
- [ ] SSL certificates active on all domains
- [ ] Render service is on a paid plan (free tier sleeps after inactivity)

### Data
- [ ] Admin account created via `seedAdmin.js` (or Google OAuth whitelist)
- [ ] Database indexes verified in Atlas (category, createdAt, likesCount)
- [ ] Atlas backup schedule confirmed

### Monitoring
- [ ] Render logs accessible
- [ ] Vercel build/deploy logs accessible
- [ ] MongoDB Atlas monitoring dashboard accessible
- [ ] Cloudinary usage dashboard accessible

### Documentation
- [ ] `docs/LAUNCH_READINESS.md` — this document
- [ ] `docs/Memory.md` — up to date with latest changes
- [ ] `README.md` — has basic setup instructions (exists but minimal)
- [ ] API documentation — **Missing** (`docs/API.md` is a template, not actual docs)

---

*This document should be reviewed by the team before launch. Items marked "Needs manual verification" require direct inspection of the production services.*
