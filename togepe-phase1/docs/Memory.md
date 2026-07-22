You are the AI Project Memory Manager.

Generate Memory.md.

Purpose:

This document will continuously store project progress so AI never loses context.

Include:

Project Overview

Current Stack

Current Folder Structure

Completed Features

Pending Features

Known Bugs

Decisions Taken

Database Schema Summary

API Summary

Current Phase

Next Tasks

Daily Progress Log

Developer Notes

AI Instructions

Whenever new features are completed, update this file automatically.

This file should become the permanent memory of the project.

---

## Project Overview

Pinitup is a Pinterest-inspired AI Prompt sharing platform where users can discover, save, organize and manage high-quality AI prompts.

## Current Stack

**Frontend:** React 18, Vite 5, JavaScript (JSX), Tailwind-free (inline styles + CSS files), Framer Motion, Lucide React icons, React Router v6, Axios

**Backend:** Node.js, Express.js, MongoDB Atlas, Mongoose, JWT, Passport (Google OAuth), Cloudinary, Multer

**Design:** White minimal PromptPin-inspired theme — white backgrounds, black text, #E5E7EB borders, no shadows on chrome, 18px border radius on cards

**Deployment targets:** Vercel (client), Render (server)

## Completed Features

### Phase 1 — Auth + Core CRUD
- JWT authentication (register, login, Google OAuth)
- AuthContext with single-source-of-truth auth state (token, user, login, logout)
- ProtectedRoute component for route-level auth gating
- UserMenu component with avatar dropdown + logout
- Centralized axios instance with 401 interceptor routed through AuthContext
- Content CRUD (create, read, delete) with Cloudinary image upload
- Feed page with search, category filter, sort
- PromptDetail page
- Dashboard with stats, recent/trending prompts, quick actions
- Responsive Navbar + collapsible Sidebar layout
- ErrorBoundary, Toast, TagInput reusable components
- Seed admin script

### Phase 1 — Likes
- Backend: toggleLike with denormalized likesCount sync
- Backend: isLiked attachment via bulk Like query on content endpoints
- Frontend: LikeButton component (optimistic updates, spring animation)

### Phase 1 — Boards (Collections)
- Backend: Board model (owner, name, description, savedContent[], timestamps, unique owner+name index)
- Backend: Full CRUD — createBoard, getMyBoards, getBoardById, updateBoard, deleteBoard
- Backend: saveContentToBoard / removeContentFromBoard with duplicate prevention
- Backend: getMyBoards accepts optional `?contentId=X` query param — returns `isSaved` boolean per board
- Backend: getSavedContentIds endpoint — returns flat array of all content IDs saved across user's boards
- Backend: All routes protected with auth middleware, ownership checks on update/delete/save
- Frontend: SaveToBoardModal — toggle behavior (save/remove), shows checkmark for boards that already contain the prompt, optimistic UI updates, isSaved awareness via `?contentId=X`
- Frontend: BoardCard component (name, description, prompt count, edit/delete actions)
- Frontend: Boards page (list all user's boards, create/edit/delete modals, toast feedback)
- Frontend: BoardDetail page (view saved prompts, remove from board)
- Frontend: Filled BookmarkCheck icon on PromptCard/PromptDetail when prompt is saved to any board (persisted via /boards/saved-ids)
- Frontend: Save button added to PromptCard and PromptDetail with active state styling
- Frontend: Sidebar updated — "Categories" replaced with "Boards" link

### Phase 1 — Search & Filters
- Backend: Server-side search via regex on `title`, `description`, `prompt`, `tags` (case-insensitive)
- Backend: Server-side category filter via `?category=` query param
- Backend: Server-side sort via `?sort=` — options: `newest` (default), `oldest`, `popular` (most liked), `most_saved` (aggregation on Board collection)
- Backend: `GET /api/content/categories` — returns distinct categories with counts via aggregation
- Backend: MongoDB indexes added — `category`, `createdAt` desc, `likesCount` desc
- Backend: Fixed `/content/ping` route ordering (moved before `/:id` to avoid collision)
- Frontend: Debounced search input (400ms) — server-side filtering, no client-side filter/sort
- Frontend: URL-based filter state via `useSearchParams` — `/feed?q=...&category=...&sort=...` persisted and shareable
- Frontend: Categories fetched from dedicated endpoint on mount (not derived from loaded content)
- Frontend: Active filter pills with "Clear Filters" button in toolbar
- Frontend: Searching indicator (spinning Loader2) during server-side search
- Frontend: Navbar search bar connected to Feed via URL params (Enter navigates to `/feed?q=...`)
- Frontend: FeedToolbar updated with "Most Saved" sort option

### Phase 1 — Share
- Frontend: `sharePrompt` utility (`utils/sharePrompt.js`) — builds canonical URL, tries Web Share API first, falls back to clipboard copy, returns `{ success, method }` for caller to decide toast behavior
- Frontend: PromptCard — Share icon button (icon-only, small variant) in the like-row, triggers toast via `onShare` callback
- Frontend: PromptDetail — Share button (icon + label) in actions bar, triggers toast directly
- Frontend: PromptGrid updated to pass `onShare` through to PromptCard
- Frontend: Feed.jsx wires `onShare` to trigger success toast
- CSS: `.share-button` pill-shaped button (green tint on hover, matching existing conventions), `.share-button--small` icon-only variant, `.share-spinner` animation
- No backend changes — share URL is `{origin}/prompt/{id}` (existing protected route)

### Phase 1 — Pinterest-style UI
- Feed grid uses CSS `column-count` masonry (5→4→3→2 columns responsive)
- PromptCard: image-first, floating Like/Save/Share on hover, gradient overlay, category badge, author row
- Horizontal category strip: sticky, scrollable, frosted-glass, replaces in-toolbar chips
- FeedToolbar simplified: search + sort + refresh, left/right layout
- Navbar cleaned: removed bell, removed subtitle, rgba search bar, subtle active nav links
- PromptDetail: larger image (1.1fr), edge-to-edge layout, cleaner spacing
- FeedSkeleton: 12 cards with variable heights, masonry grid
- All existing features preserved (auth, likes, boards, sharing, search, dashboard)

### Phase 1 — Landing Page (Sprint 1)
- Created `LandingPage.jsx` — full professional landing page with Hero, Features (6 cards), Categories (8 horizontal cards), Workflow (4 steps), Pricing (Free/Pro), FAQ (6 items accordion), CTA block, Footer
- Created `LandingPage.css` — complete responsive styles (1024px → 768px → 576px breakpoints)
- Hero section: headline + subtitle + CTA buttons + stats row + masonry preview, background orbs + grid overlay
- Features: 6-card grid with icons, hover lift animation
- Categories: horizontal scroll strip with 8 prompt categories, frosted-glass cards
- Workflow: 4-step process with connector lines
- Pricing: 2-card comparison (Free vs Pro) with badge, feature list
- FAQ: 6 items with accordion open/close via `useState`, ChevronDown toggle
- CTA block: gradient background + grid overlay + final sign-up button
- Footer: brand tagline, link columns (Product/Company/Legal), social links, copyright
- All sections use Framer Motion `useInView` scroll-triggered fade-in animations
- `App.jsx` updated: `/` renders `<LandingPage />` (was `<Navigate to="/login" />`), catch-all now redirects to `/`
- Nav: "Login" and "Get Started" buttons link to `/login` and `/signup` (signup not yet implemented)
- Fully self-contained — no backend dependency, no auth checks, no shared layout
- Verified clean production build (vite build passes)

### Phase 2 — Role-Based Access Control (Sprint 2)
- **Backend — Google OAuth admin assignment:**
  - `config/passport.js` — `ADMIN_EMAILS` set: `content@npl.live`, `shylesh@npl.live`, `dev@npl.live`
  - New Google users with admin emails get `role: "admin"` on creation
  - Existing users linked via Google with admin emails get auto-promoted on login
  - Existing local users with admin emails get promoted when linking Google account
- **Backend — Admin stats API:**
  - Created `controllers/adminController.js` — `getAdminStats` returns `totalUsers`, `totalPrompts`, `totalBoards`, `recentActivity` (last 5 prompts with uploader name)
  - Created `routes/adminRoutes.js` — `GET /api/admin/stats` (protected + requireAdmin)
  - Registered in `server.js` as `/api/admin`
- **Frontend — AdminRoute component:**
  - Created `components/AdminRoute.jsx` — checks `isAuthenticated` + `user.role === "admin"`, redirects non-admins to `/feed`, unauthenticated to `/login`
- **Frontend — Admin dashboard page:**
  - Created `pages/AdminPage.jsx` + `AdminPage.css` — stat cards (Users, Prompts, Boards), Recent Activity list with shimmer loading
- **Frontend — Route rewiring:**
  - `/feed` and `/prompt/:id` are now public (no ProtectedRoute) — guests can browse
  - `/admin` wrapped with `AdminRoute` — non-admins redirected to `/feed`
  - `/profile` route added (reuses Dashboard for now)
  - Catch-all redirects to `/`
- **Frontend — Guest browsing:**
  - `Feed.jsx` — `saved-ids` fetch skipped for guests; like/save modal only rendered when authenticated; `onToggleLike` and `onSave` passed as `undefined` for guests
  - `PromptCard.jsx` — like/save buttons conditionally rendered based on `onToggleLike`/`onSave` prop presence; share always visible
  - `PromptDetail.jsx` — like/save/delete actions hidden for guests; likes count shown as static text; `saved-ids` fetch skipped for guests
- **Frontend — Role-aware navigation:**
  - `Navbar.jsx` — imports `useAuth`; shows "Explore" only for guests; "Explore + Boards" for users; "Explore + Boards + Admin" for admins; Upload button and UserMenu only for authenticated users; Login button for guests
  - `Sidebar.jsx` — imports `useAuth`; injects Admin link (Shield icon) for admin users between Boards and Settings
- **Permissions matrix:**
  - Guest: Landing, Explore (browse), Prompt Detail (read-only), Share — no Like, Save, Upload, Boards
  - User: Full access except Admin
  - Admin: Full access including Admin dashboard
- **Existing infrastructure reused:**
  - `User.role` field already existed in model (enum `["user", "admin"]`, default `"user"`)
  - `generateToken` already included `role` in JWT payload
  - Auth responses already returned `user.role`
  - `roleMiddleware.js` (`requireAdmin`) already existed
  - `optionalAuth.js` already existed
- Verified clean production build (vite build passes)

### Phase 2 — Guest Browsing Limitation
- **Frontend — 5-prompt cap for guests:**
  - `Feed.jsx` — guests see only first 5 prompts (`GUEST_PROMPT_LIMIT = 5`); `visiblePrompts` slices `prompts.slice(0, 5)` when `!isAuthenticated`; authenticated users see all
  - After 5th prompt, renders `GuestFeedCTA` component below the masonry grid
  - `GuestFeedCTA` uses `column-span: all` to break out of masonry columns as a full-width block
- **GuestFeedCTA component:**
  - Created `components/feed/GuestFeedCTA.jsx` — premium login wall with lock icon, benefits list (Like, Save, Upload), "Continue with Google" button (Google SVG icon), "Sign In" button, "Free forever · No credit card required" note, "Join thousands of creators" sparkle
  - Created `components/feed/GuestFeedCTA.css` — gradient background, radial glow, responsive layout (stacked benefits on mobile)
  - Both buttons navigate to `/login`; Google button shows Google SVG icon
  - Framer Motion fade-in + slide-up animation
- **No backend changes** — frontend slicing only for MVP
- **Authenticated experience unchanged** — `isAuthenticated` users see full untruncated feed
- Verified clean production build (vite build passes)

### Phase 2 — PromptPin UI Overhaul
- **Navbar.jsx:** White bg, thin bottom border, centered search (860px max, #F3F4F6, 999px radius), black logo + "Pinitup", right-side links (Explore, Boards, Create, Admin), black avatar, "Sign out" pill
- **Feed.jsx:** "Prompt Board" header, image thumbnail category strip (160×76px cards with bg images + white pill labels), demo content fallback from `demoPrompts.js`
- **Feed.css:** White bg, 5-col CSS `column-count` masonry (16px gap, 18px radius), image category strip, black gradient hover overlay
- **PromptCard.jsx:** Image-first, category badge (white pill top-left), hover overlay (black gradient, white rounded buttons for Heart/Bookmark/Share/MoreHorizontal), title bottom-left, author row with avatar + name
- **Sidebar.jsx:** White bg, light borders, #F3F4F6 active state, neutral bottom text
- **UserMenu.jsx:** White dropdown, black text, #E5E7EB borders, shadow elevation, "Sign out" label
- **GuestFeedCTA.css:** Black accent replacing indigo/purple (icon bg, sign-in button, sparkle text)
- **Demo content:** Created `client/src/data/demoPrompts.js` — 48 prompts across 12 categories, picsum.photos placeholders, 8 authors, category images, category counts
- **Feed.jsx integration:** Server prompts first; demo fallback when API empty/errored; demo prompts filterable by category/search/sort; guest 5-prompt limit applies to demo content
- All existing features preserved: auth, likes, boards, sharing, search, RBAC, guest browsing
- Verified clean production build (vite build passes)

### Phase 2 — Feed as Homepage
- **Route change:** `/` now renders `<Feed />` instead of `<LandingPage />`
- `/feed` route removed — all internal links updated from `/feed` to `/`
- `LandingPage.jsx` and `LandingPage.css` preserved in codebase but no longer routed
- Updated references in: `App.jsx`, `Navbar.jsx`, `Sidebar.jsx`, `AdminRoute.jsx`, `PromptDetail.jsx`, `WelcomeSection.jsx`, `TrendingPrompts.jsx`, `RecentPrompts.jsx`, `QuickActions.jsx`
- Guest browsing (5-prompt cap + CTA) works on `/` as it did on `/feed`
- Prompt Detail (`/prompt/:id`) remains public
- Verified clean production build (vite build passes)

### Phase 2 — PromptPin UI Overhaul
- **White minimal theme** replacing previous dark/glassmorphism design
- **Navbar.jsx rewritten:** White background, thin bottom border (#E5E7EB), centered search bar (860px max, 42px height, #F3F4F6 bg, 999px radius), black logo + "Pinitup" text, right-side links (Explore, Boards, Create, Admin), black circle avatar, "Sign out" pill button
- **Feed.jsx rewritten:** "Prompt Board" centered header with title + subtitle, image thumbnail category strip (160×76px cards with background images + white pill labels), demo content integration (40-60 prompts across 12 categories from `demoPrompts.js`), server-first with demo fallback
- **Feed.css rewritten:** White background, 5-column CSS `column-count` masonry (16px gap, 18px border radius), image thumbnail category strip (16px radius, 3px black ring on active), black gradient hover overlay on cards
- **PromptCard.jsx rewritten:** Image-first layout, category badge (white pill top-left), hover overlay (black gradient bottom) with Pin/Heart/Share/MoreHorizontal in rounded white buttons, title bottom-left (white, 14px, 600 weight), author row (avatar circle + name in white), no card body below image
- **Sidebar.jsx rewritten:** White background, light theme (black text, #F3F4F6 active bg, #E5E7EB borders), replaced purple upgrade card with neutral text
- **UserMenu.jsx rewritten:** White dropdown, #111111 text, #E5E7EB borders, "Sign out" label, shadow-based elevation
- **GuestFeedCTA.css updated:** Black accent replacing indigo/purple (icon bg #F3F4F6, sign-in button #111111, sparkle text #9CA3AF)
- **Demo content data:** Created `client/src/data/demoPrompts.js` — 48 prompts across 12 categories (Fashion, Food, Product, Beauty, SaaS, Interior, Travel, Motion, Architecture, Mobile, Brand) with picsum.photos placeholder images, 8 author names, CATEGORY_IMAGES for thumbnail strip, CATEGORY_COUNTS for badge counts
- **Feed.jsx demo integration:** Server prompts take priority; when API returns empty or errors, demo prompts shown as fallback; demo prompts filterable by category/search/sort on client-side; guest 5-prompt limit applied to demo content too
- All existing features preserved: auth, likes, boards, sharing, search, RBAC, guest browsing
- Verified clean production build (vite build passes)

### Auth Architecture (as of latest commit)
- `AuthProvider` wraps `<App />` in `main.jsx` — single source of truth
- `LoginPage` and `OAuthSuccess` call `AuthContext.login()` (no direct localStorage writes)
- `ProtectedRoute` wraps `/dashboard`, `/add-prompt`, `/boards`, `/boards/:id`, `/profile`
- `AdminRoute` wraps `/admin`
- `/` (Feed) and `/prompt/:id` are public — guests can browse (5-prompt limit for guests)
- `UserMenu` integrated into `Navbar` (replaces hardcoded avatar)
- `api.js` 401 interceptor delegates to `AuthContext.logout()`
- Dashboard and AddPromptPage no longer have duplicate `localStorage` auth guards

## Pending Features

- Registration / signup UI (landing page "Get Started" button already links to `/signup`)
- User profile page (`/profile` route exists but reuses Dashboard)
- Settings page
- 404 page (catch-all now redirects to `/`)
- TailwindCSS integration (currently inline styles + CSS)

## Known Bugs

- None critical

## Decisions Taken

- AuthContext is the single owner of token/user state; no component touches localStorage directly
- ProtectedRoute handles all route-level auth; individual pages do not check tokens
- Google OAuth decodes JWT payload client-side for user info (no separate /me endpoint yet)
- White minimal PromptPin-inspired design — white backgrounds, black text, #E5E7EB borders, almost no shadows, no gradients on chrome
- No TypeScript — project uses plain JSX with Vite
- Likes use optimistic updates with server reconciliation; LikeButton handles its own API call and reverts on failure
- Content endpoints attach isLiked via bulk Like query (not aggregation pipeline) for simplicity
- Save to Board uses toggle behavior: checkmark = saved, clicking removes, optimistic UI updates
- Saved state persisted via `GET /boards/saved-ids` on page load (not session-only)
- Modal uses `?contentId=X` query param to get `isSaved` per board for accurate saved-state display
- Guest browsing limited to first 5 prompts via frontend slicing (no backend changes for MVP)
- GuestFeedCTA uses `column-span: all` to break out of masonry columns as full-width block
- Demo content (48 prompts) serves as default feed when API is empty; server data always takes priority
- Category thumbnails use image backgrounds (picsum.photos) with white pill labels — not text-only chips
- CORS uses comma-separated `CLIENT_URL` env var parsed into an allowlist — supports multiple production origins (www.pinitup.io, pinitup.io, pinitup-ten.vercel.app) plus localhost dev; no-origin requests (curl, server-to-server) always allowed; `credentials: true` for cookie/auth header forwarding
- `VITE_API_URL` must be set in Vercel env vars at build time — client falls back to localhost otherwise; console warning added when missing
- `GOOGLE_CALLBACK_URL` on Render must match the deployed backend URL (not localhost) for OAuth to work in production

## Database Schema Summary

- **User:** name, email, passwordHash, role (user/admin), provider (local/google), googleId, avatar
- **Content:** type, mediaUrl, mediaPublicId, title, description, category, prompt, tags[], uploadedBy (ref User), likesCount, sharesCount — indexes: `category`, `createdAt` desc, `likesCount` desc
- **Board:** owner (ref User), name, description, savedContent[] (ref Content), timestamps, unique(owner, name) index — fully implemented
- **Like:** user (ref User), content (ref Content), unique compound index — fully implemented

## API Summary

- `POST /api/auth/register` — create account
- `POST /api/auth/login` — email/password login, returns JWT
- `GET /api/auth/google` — Google OAuth redirect
- `GET /api/auth/google/callback` — Google OAuth callback, redirects with token
- `POST /api/content` — create content (auth + multer upload)
- `GET /api/content` — list content (public, optional auth for guest limits) — supports `?search=`, `?category=`, `?sort=newest|oldest|popular|most_saved`, `?page=`, `?limit=`
- `GET /api/content/categories` — distinct categories with prompt counts
- `GET /api/content/:id` — get single content
- `DELETE /api/content/:id` — delete content (auth required)
- `POST /api/likes/:contentId` — toggle like/unlike (auth required), returns `{ liked, likesCount }`
- `POST /api/boards` — create board (auth required)
- `GET /api/boards` — list current user's boards (auth required, optional `?contentId=X` to return `isSaved` per board)
- `GET /api/boards/saved-ids` — returns flat array of all content IDs saved across user's boards (auth required)
- `GET /api/boards/:id` — get board with saved prompts (auth required, ownership check)
- `PUT /api/boards/:id` — update board name/description (auth required, ownership check)
- `DELETE /api/boards/:id` — delete board (auth required, ownership check)
- `POST /api/boards/:id/save/:contentId` — save prompt to board (auth required, duplicate prevention)
- `DELETE /api/boards/:id/save/:contentId` — remove prompt from board (auth required)
- `GET /api/likes/ping` — working
- `GET /api/admin/stats` — admin-only: returns totalUsers, totalPrompts, totalBoards, recentActivity

## Current Phase

Phase 2 — Production Deployment Fix (CORS + env vars)

## Next Tasks

1. Set `VITE_API_URL` in Vercel env vars to Render backend URL
2. Set `CLIENT_URL` (comma-separated) and `GOOGLE_CALLBACK_URL` on Render
3. User profile page (proper implementation, not Dashboard reuse)
4. Settings page
5. 404 page (catch-all now redirects to `/`)
6. Prompt detail page styling update to match PromptPin white theme
7. Responsive navbar mobile hamburger menu
8. Production-quality category thumbnail images (replace picsum.photos placeholders)

## Daily Progress Log

### 2026-07-22
- Wired AuthProvider into main.jsx (was orphaned)
- Updated LoginPage and OAuthSuccess to use AuthContext.login() instead of direct localStorage
- Wrapped protected routes with ProtectedRoute in App.jsx
- Integrated UserMenu into Navbar (replaced hardcoded avatar)
- Removed duplicate auth guards from Dashboard and AddPromptPage
- Added catch-all route in App.jsx
- Verified clean build (vite build passes)
- **Likes feature implemented:**
  - Backend: likeController (toggleLike), likeRoutes wired with protect middleware
  - Backend: contentController now returns isLiked for authenticated users (getAllContent, getContentById)
  - Frontend: LikeButton component (reusable, optimistic updates, spring animation)
  - Frontend: LikeButton integrated into PromptCard (feed) and PromptDetail (detail page)
  - Frontend: Feed tracks likedIds Set and syncs state on toggle
  - Frontend: "Most Liked" sort works via existing likesCount sort
  - CSS: like-button styles with active/hover/small variants
  - Verified clean build
- **Boards feature implemented:**
  - Backend: Board model updated with description field + unique(owner, name) index
  - Backend: boardController — full CRUD (create, list, get, update, delete) + save/remove content
  - Backend: boardRoutes wired with protect middleware on all routes
  - Backend: ownership checks on get/update/delete/save operations
  - Backend: duplicate saved prompt prevention via manual check (not $addToSet for explicit error messages)
  - Frontend: SaveToBoardModal — fetches boards, pick existing or create new, save prompt
  - Frontend: BoardCard — name, description, prompt count, edit/delete actions
  - Frontend: Boards page — list all user's boards, create/edit/delete modals, toast feedback
  - Frontend: BoardDetail page — view saved prompts, remove from board, back navigation
  - Frontend: Save button added to PromptCard (like-row) and PromptDetail (actions bar)
  - Frontend: App.jsx updated with /boards and /boards/:id protected routes
  - Frontend: Sidebar "Categories" link replaced with "Boards" link
   - CSS: Boards.css (boards page, board cards, board detail, shared modal styles, save button)
   - Verified clean production build
- **Save to Board — toggle behavior + persisted saved state:**
   - Backend: `getMyBoards` accepts `?contentId=X` query param, returns `isSaved` boolean per board
   - Backend: `getSavedContentIds` endpoint — returns flat array of saved content IDs for current user
   - Backend: Route `/boards/saved-ids` registered before `/:id` to avoid collision
   - Frontend: SaveToBoardModal rewritten — toggle behavior (save/remove), checkmark on saved boards, optimistic updates
   - Frontend: PromptCard accepts `saved` prop, renders filled `BookmarkCheck` icon when saved
   - Frontend: PromptGrid passes `savedIds` Set through to PromptCard
   - Frontend: Feed fetches saved IDs on mount, tracks `savedIds` state, wires modal callback
   - Frontend: PromptDetail fetches saved IDs on mount, tracks `isSaved`, wires modal callback
   - Frontend: CSS — `.save-button--active` + modal saved-state classes (`.stm-board-item--saved`, etc.)
   - Bug fix: Added missing `X` import in Boards.jsx (was used in modals but not imported)
   - Verified clean production build
- **Like double-click race condition bug fix:**
   - Root cause: LikeButton used `useState` for `busy` flag; `setBusy(true)` is async, so a rapid double-click fires two API requests — first deletes the Like, second creates a new one, leaving the prompt liked with wrong count
   - Fix (frontend): Added `useRef` busy guard for synchronous duplicate-click prevention; `busyRef.current = true` executes before the second click can proceed
   - Fix (backend): `toggleLike` now recalculates `likesCount` via `Like.countDocuments()` instead of manual increment/decrement — self-heals any count drift from race conditions
   - Verified clean production build
- **Prompt delete feature:**
   - Root cause: Backend `DELETE /api/content/:id` endpoint existed and worked, but no frontend UI called it — the feature was never wired up
   - Frontend: PromptDetail page now shows a Delete button for the prompt's owner only (`isOwner` check via `uploadedBy._id === user._id`)
   - Frontend: Confirmation modal (reuses `.stm-*` shared modal classes) prevents accidental deletes
   - Frontend: On successful delete, shows success toast then navigates to `/feed` after 800ms
   - Frontend: Uses `useAuth()` to get current user for ownership check
   - CSS: Added `.prompt-detail__delete-btn` danger-variant styles
   - Verified clean production build
- **Search & Filters (server-side):**
   - Backend: `getAllContent` now accepts `?search=`, `?category=`, `?sort=` query params
   - Backend: Search uses case-insensitive regex on `title`, `description`, `prompt`, `tags` with special-char escaping
   - Backend: "Most saved" sort uses aggregation pipeline on Board collection to count saves per content
   - Backend: New `GET /api/content/categories` endpoint — returns distinct categories with counts
   - Backend: Added MongoDB indexes on `category`, `createdAt`, `likesCount` for query performance
   - Backend: Fixed `/content/ping` route ordering (moved before `/:id` route)
   - Frontend: Feed.jsx rewritten — server-side filtering via API params, removed client-side `filteredPrompts`/`sortedPrompts` useMemos
   - Frontend: Debounced search input (400ms) via `setTimeout`/`useRef` pattern
   - Frontend: URL-based filter state via `useSearchParams` — `/feed?q=...&category=...&sort=...` persisted, shareable, back-button friendly
   - Frontend: Categories fetched from dedicated `/content/categories` endpoint on mount (not derived from loaded content)
   - Frontend: Active filter pills (search, category, sort) displayed in toolbar with "Clear Filters" button
   - Frontend: Searching indicator (spinning Loader2 icon) during server-side search
   - Frontend: Navbar search bar connected to Feed via URL params — Enter navigates to `/feed?q=...`
   - Frontend: FeedToolbar updated with "Most Saved" sort option
   - CSS: Added `.feed-toolbar__active-filters`, `.feed-toolbar__active-pill`, `.feed-toolbar__clear-btn` styles
   - Verified clean production build
- **Share functionality:**
   - Frontend: Created `utils/sharePrompt.js` — reusable share utility that builds URL from origin + `/prompt/` + id, tries Web Share API (mobile), falls back to clipboard copy (desktop), handles AbortError gracefully
   - Frontend: PromptCard — added Share2 icon button (icon-only small variant) in the like-row, wired `onShare` prop for toast callback from Feed
   - Frontend: PromptDetail — added Share button (icon + label) in actions bar, triggers toast directly via local `handleShare`
   - Frontend: PromptGrid updated to pass `onShare` through to PromptCard
   - Frontend: Feed.jsx wires `onShare` callback to trigger success toast ("Link copied to clipboard!")
   - CSS: `.share-button` pill-shaped (green tint on hover), `.share-button--small` icon-only variant, `.share-spinner` animation
    - No backend changes needed — share URL is purely client-side construction using existing `/prompt/:id` route
   - Verified clean production build
- **Dashboard Quick Actions grid polish:**
   - Grid now uses `grid-auto-rows: 1fr` so every card has identical height
   - Added `.dashboard-action { display: contents }` wrapper to flatten Link/button into grid items
   - Arrow pinned to far right via `margin-left: auto` + `flex-shrink: 0`
   - Icon container pinned via `flex-shrink: 0` to prevent compression
   - Content area uses `min-width: 0` to prevent text overflow
   - Padding normalized to 24px on all cards
   - Mobile (<576px): single column, card stacks vertically, arrow hidden
   - Responsive breakpoints preserved: 2-col ≥992px, 1-col <992px
   - Verified clean production build
- **UI/UX polish pass (accessibility & bug fixes):**
   - Fixed critical comma operator bug in Feed.jsx (`return next, { replace: true }` → `setSearchParams(next, { replace: true })`) — URL params never updated when filters changed
   - Fixed stale state bug in Feed.jsx — `isInitialLoad.current = false` moved from `finally` to success path; `finally` block preserved stale state after failed load
   - Fixed missing gap in `.feed-prompt-card__like-row` CSS (buttons were flush)
   - Fixed `-webkit-line-clamp: 3` missing in Feed.css and Dashboard.css (broken text truncation)
   - Created `LoginPage.css` with `.login-input:focus` purple ring, replaced inline `outline: "none"`
   - Updated `TagInput.jsx` — focus ring, case-insensitive duplicate detection, `aria-label`
   - Fixed touch-device remove button visibility in Boards.css (`@media (hover: none)` opacity fallback)
   - Fixed modal overflow in Boards.css (`overflow-y: auto`, `-webkit-backdrop-filter`)
   - Added `stm-input:focus` box-shadow ring in Boards.css
   - Added `prefers-reduced-motion` in Feed.css
   - Added Escape key + focus trap to SaveToBoardModal (returns focus on close)
   - Added Escape key to all delete confirmation modals (PromptDetail, Boards.jsx)
   - Removed overlay click dismiss from destructive modals (PromptDetail delete, Boards delete)
   - Added `role="dialog"` + `aria-modal="true"` to all modals
   - Added `aria-label` to all icon-only buttons (Navbar hamburger, bell, Sidebar close, all modal close buttons)
   - Added `role="search"` to FeedToolbar search container
   - Added `aria-pressed` to category filter chips
   - Added `role="menu"` + `role="menuitem"` to UserMenu dropdown
   - Added `aria-haspopup` + `aria-expanded` to UserMenu trigger
   - Fixed EmptyFeed wrong icon — clear-filters variant uses `RotateCcw`
   - Added `setTimeout` cleanup via `useRef` in PromptDetail (prevents post-unmount navigation)
   - Boards.jsx — stacked modal Escape handling, form input aria-labels, flex-wrap on create-actions
   - Verified clean production build

### Phase 1 — UI/UX Polish & Accessibility
- Fixed critical comma operator bug in `Feed.jsx` — URL params were never updating (`return next, { replace: true }` → `setSearchParams(next, { replace: true })`)
- Fixed `Feed.jsx` stale state after failed initial load (`isInitialLoad.current = false` moved from finally to success path)
- Fixed missing gap in `.feed-prompt-card__like-row` (buttons were flush together)
- Fixed broken `-webkit-line-clamp: 3` in `Feed.css` and `Dashboard.css`
- Created `LoginPage.css` with `.login-input` focus styles (purple ring), replaced inline `outline: "none"`
- Updated `TagInput.jsx` — focus ring, case-insensitive duplicate detection, `aria-label`
- Fixed Boards.css invisible remove button on touch devices (`@media (hover: none)` fallback)
- Fixed Boards.css modal `overflow: hidden` → `overflow-y: auto`; added `-webkit-backdrop-filter`
- Fixed `stm-input:focus` box-shadow ring in Boards.css
- Added `prefers-reduced-motion` support in `Feed.css`
- Added Escape key + focus trap to `SaveToBoardModal` (returns focus to trigger on close)
- Added Escape key handling to delete confirmation modals (PromptDetail, Boards)
- Fixed delete modal overlay click — no longer dismisses destructive modals via overlay
- Added `role="dialog"` + `aria-modal="true"` to all modals (SaveToBoard, PromptDetail delete, Boards create/edit/delete)
- Added `aria-label` to all icon-only buttons (Navbar hamburger `aria-label="Open menu"`, bell `aria-label="Notifications"`, Sidebar close `aria-label="Close sidebar"`, all modal close buttons)
- Added `role="search"` to FeedToolbar search container
- Added `aria-pressed` to category filter chips
- Added `aria-haspopup` + `aria-expanded` to UserMenu trigger button
- Added `role="menu"` + `role="menuitem"` to UserMenu dropdown
- Removed hover-dependent JS from UserMenu dropdown (pure CSS now)
- Fixed `EmptyFeed` wrong icon — clear-filters variant now uses `RotateCcw` instead of `X`
- Added `setTimeout` cleanup on unmount via `useRef` in PromptDetail (prevents navigation after unmount)
- Fixed Boards.jsx modal Escape key — stacked modals handled in priority order (delete > edit > create)
- Added `aria-label` to all Boards.jsx modal form inputs
- Added `flex-wrap` to `.stm-create-actions` + viewport overflow support for short screens
- Verified clean production build
- **Pinterest-style UI refactor:**
   - Feed grid switched from CSS Grid to CSS `column-count` masonry layout (5→4→3→2 columns across breakpoints)
   - PromptCard redesigned: image-first layout with no fixed height, natural aspect ratio preservation
   - Floating action buttons (Like, Save, Share) overlay on image bottom with gradient scrim — appear on hover
   - Category badge overlays on image top-left with frosted-glass background
   - Card body reduced to title (2-line clamp) + author avatar/name + inline like count — minimal below-fold
   - New horizontal category strip: sticky below navbar, horizontally scrollable, frosted-glass background, replaces in-toolbar chips
   - FeedToolbar simplified: removed category chips (moved to strip), removed result count from toolbar body, cleaner layout with left/right split
   - Feed.jsx: category strip rendered above toolbar, integrated with URL-based filter state
   - FeedSkeleton updated: 12 skeleton cards with variable heights (160-280px) matching masonry, masonry column grid
   - PromptCard: `onToggleLike` and `onSave` now called directly (not through inner LikeButton/save-button components in the card — those are for PromptDetail)
   - PromptCard: Author avatar with initials, like count displayed inline below card
   - Navbar simplified: removed bell icon, removed subtitle text, cleaner search bar with rgba background, nav links use subtle active state
   - PromptDetail.css: image takes 1.1fr width (larger than info panel), no gap between image and info (edge-to-edge), taller default image (400px min)
   - All existing features preserved: auth, likes, boards, sharing, search, dashboard, prompt detail
   - Responsive: masonry scales from 5 columns → 2 columns on mobile, category strip scrollable on all sizes
   - Verified clean production build
- **Landing page (Sprint 1):**
  - Created `LandingPage.jsx` — Hero (title, subtitle, CTAs, stats, masonry preview), Features (6 cards), Categories (8 horizontal), Workflow (4 steps), Pricing (Free/Pro), FAQ (6 accordion items), CTA block, Footer
  - Created `LandingPage.css` — dark (#0b0b0f) theme, indigo/violet gradient accent, full responsive (1024/768/576), frosted-glass category cards, gradient CTA block
  - Updated `App.jsx` — `/` now renders `<LandingPage />` instead of `<Navigate to="/login" />`; catch-all redirects to `/`
  - All sections use Framer Motion `useInView` for scroll-triggered fade-in
  - Nav links: "Login" and "Get Started" — no auth dependency on landing page
  - Verified clean production build
- **Role-Based Access Control (Sprint 2):**
  - Backend: `config/passport.js` — Google OAuth now assigns `role: "admin"` for emails `content@npl.live`, `shylesh@npl.live`, `dev@npl.live`; auto-promotes existing users on login
  - Backend: Created `controllers/adminController.js` — `getAdminStats` returns total users/prompts/boards + recent activity
  - Backend: Created `routes/adminRoutes.js` — `GET /api/admin/stats` (protect + requireAdmin)
  - Backend: Registered admin routes in `server.js`
  - Frontend: Created `components/AdminRoute.jsx` — role gate (admin → page, non-admin → `/feed`, unauthenticated → `/login`)
  - Frontend: Created `pages/AdminPage.jsx` + `AdminPage.css` — stat cards + recent activity list with shimmer loading
  - Frontend: `App.jsx` rewired — `/feed` and `/prompt/:id` public; `/admin` wrapped with AdminRoute; `/profile` added (reuses Dashboard); catch-all → `/`
  - Frontend: `Feed.jsx` — guest-safe: skips `saved-ids` fetch, passes `undefined` for `onToggleLike`/`onSave` when unauthenticated
  - Frontend: `PromptCard.jsx` — like/save buttons conditionally rendered based on prop presence
  - Frontend: `PromptDetail.jsx` — like/save/delete hidden for guests; likes shown as static text; `saved-ids` skipped for guests
  - Frontend: `Navbar.jsx` — role-aware: guests see Explore + Login; users see Explore + Boards + Upload; admins see Explore + Boards + Admin + Upload
  - Frontend: `Sidebar.jsx` — Admin link (Shield icon) injected for admin users between Boards and Settings
  - Verified clean production build
- **Guest browsing limitation:**
  - Created `components/feed/GuestFeedCTA.jsx` — premium login wall: lock icon, benefits list (Like, Save, Upload), Google button, Sign In button, "Free forever" note, sparkle
  - Created `components/feed/GuestFeedCTA.css` — gradient background, radial glow, responsive stacked benefits
  - Updated `Feed.jsx` — guests see only first 5 prompts (`GUEST_PROMPT_LIMIT = 5`); `visiblePrompts` slices array when `!isAuthenticated`; `GuestFeedCTA` rendered after 5th prompt using `column-span: all`
  - Authenticated users see full untruncated feed — no changes to their experience
  - No backend changes — frontend slicing only for MVP
  - Verified clean production build
- **Feed as homepage:**
  - `App.jsx` — `/` now renders `<Feed />` instead of `<LandingPage />`; removed `/feed` route
  - Updated all `/feed` references to `/` across: Navbar, Sidebar, AdminRoute, PromptDetail, WelcomeSection, TrendingPrompts, RecentPrompts, QuickActions
  - `LandingPage.jsx` + `LandingPage.css` preserved but no longer routed
  - Guest browsing (5-prompt cap + CTA) works on `/`
  - Verified clean production build
- **PromptPin UI overhaul:**
  - Created `client/src/data/demoPrompts.js` — 48 prompts across 12 categories with picsum.photos placeholders, 8 authors, category images for thumbnails, category counts
  - Rewrote `Navbar.jsx` — white bg, thin bottom border, centered search (860px max, #F3F4F6, 999px radius), black logo, right-side nav links, black avatar, "Sign out" pill
  - Rewrote `Feed.jsx` — "Prompt Board" centered header, image thumbnail category strip (160×76px cards with bg images + white pill labels), demo content as fallback when API empty, server-first data flow
  - Rewrote `Feed.css` — white bg, 5-col column-count masonry (16px gap, 18px radius), image category thumbnails with active ring, hover overlay styles
  - Rewrote `PromptCard.jsx` — image-first, category badge (white pill top-left), hover overlay (black gradient bottom, white rounded action buttons), title bottom-left, author row with avatar + name
  - Rewrote `Sidebar.jsx` — white bg, light borders, #F3F4F6 active state, neutral bottom card
  - Rewrote `UserMenu.jsx` — white dropdown, black text, shadow elevation, "Sign out" label
  - Updated `GuestFeedCTA.css` — black accent replacing indigo/purple (icon bg, sign-in button, sparkle text)
  - Fixed `sharePrompt` import in PromptCard.jsx (default export, not named)
  - Verified clean production build

## Developer Notes

- All files are `.jsx`/`.js`, not TypeScript — follow existing convention
- No Tailwind — all styling is inline or CSS files
- Each page independently renders `<Navbar>` and `<Sidebar>` (no shared layout wrapper yet)
- Server runs on port 501, client on port 5173
- **Deployment:** Vercel (client) + Render (server); env vars must be set in both dashboards
- **Vercel env vars:** `VITE_API_URL=https://<render-app>.onrender.com/api` (Production + Preview)
- **Render env vars:** `CLIENT_URL=https://www.pinitup.io,https://pinitup.io,https://pinitup-ten.vercel.app,http://localhost:5173`, `GOOGLE_CALLBACK_URL=https://<render-app>.onrender.com/api/auth/google/callback`

## AI Instructions

- Always read docs/ files before making changes (priority: Rules > Memory > Architecture > API > Database > PRD > Phases > Design)
- Never generate placeholder code
- Never duplicate logic
- Always write production-ready code
- Update Memory.md when work is completed
