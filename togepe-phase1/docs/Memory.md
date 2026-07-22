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

### Auth Architecture (as of latest commit)
- `AuthProvider` wraps `<App />` in `main.jsx` — single source of truth
- `LoginPage` and `OAuthSuccess` call `AuthContext.login()` (no direct localStorage writes)
- `ProtectedRoute` wraps `/dashboard`, `/feed`, `/add-prompt`, `/prompt/:id`, `/boards`, `/boards/:id`
- `UserMenu` integrated into `Navbar` (replaces hardcoded avatar)
- `api.js` 401 interceptor delegates to `AuthContext.logout()`
- Dashboard and AddPromptPage no longer have duplicate `localStorage` auth guards

## Pending Features

- Admin dashboard UI
- User profile page
- Registration page (API exists, no UI)
- Guest browsing (limit to 5 prompts)
- Categories management page
- Settings page
- 404 page (currently redirects to /login)
- TailwindCSS integration (currently inline styles + CSS)

## Known Bugs

- None critical after auth refactor

## Decisions Taken

- AuthContext is the single owner of token/user state; no component touches localStorage directly
- ProtectedRoute handles all route-level auth; individual pages do not check tokens
- Google OAuth decodes JWT payload client-side for user info (no separate /me endpoint yet)
- Dark mode first design with glassmorphism
- No TypeScript — project uses plain JSX with Vite
- Likes use optimistic updates with server reconciliation; LikeButton handles its own API call and reverts on failure
- Content endpoints attach isLiked via bulk Like query (not aggregation pipeline) for simplicity
- Save to Board uses toggle behavior: checkmark = saved, clicking removes, optimistic UI updates
- Saved state persisted via `GET /boards/saved-ids` on page load (not session-only)
- Modal uses `?contentId=X` query param to get `isSaved` per board for accurate saved-state display

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

## Current Phase

Phase 1 Complete — Auth + Likes + Boards + Search & Filters + Core CRUD operational

## Next Tasks

1. Admin dashboard
2. User profile page
3. Registration UI
4. Guest browsing limits

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

## Developer Notes

- All files are `.jsx`/`.js`, not TypeScript — follow existing convention
- No Tailwind — all styling is inline or CSS files
- Each page independently renders `<Navbar>` and `<Sidebar>` (no shared layout wrapper yet)
- Server runs on port 501, client on port 5173

## AI Instructions

- Always read docs/ files before making changes (priority: Rules > Memory > Architecture > API > Database > PRD > Phases > Design)
- Never generate placeholder code
- Never duplicate logic
- Always write production-ready code
- Update Memory.md when work is completed
