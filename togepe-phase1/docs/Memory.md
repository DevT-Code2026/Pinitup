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

### Auth Architecture (as of latest commit)
- `AuthProvider` wraps `<App />` in `main.jsx` — single source of truth
- `LoginPage` and `OAuthSuccess` call `AuthContext.login()` (no direct localStorage writes)
- `ProtectedRoute` wraps `/dashboard`, `/feed`, `/add-prompt`, `/prompt/:id`
- `UserMenu` integrated into `Navbar` (replaces hardcoded avatar)
- `api.js` 401 interceptor delegates to `AuthContext.logout()`
- Dashboard and AddPromptPage no longer have duplicate `localStorage` auth guards

## Pending Features

- Board/Collection CRUD (controller is empty, route is stub)
- Like/unlike functionality (controller is empty, route is stub)
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

## Database Schema Summary

- **User:** name, email, passwordHash, role (user/admin), provider (local/google), googleId, avatar
- **Content:** type, mediaUrl, mediaPublicId, title, description, category, prompt, tags[], uploadedBy (ref User), likesCount, sharesCount
- **Board:** owner (ref User), name, savedContent[] (ref Content) — schema only
- **Like:** user (ref User), content (ref Content), unique compound index — schema only

## API Summary

- `POST /api/auth/register` — create account
- `POST /api/auth/login` — email/password login, returns JWT
- `GET /api/auth/google` — Google OAuth redirect
- `GET /api/auth/google/callback` — Google OAuth callback, redirects with token
- `POST /api/content` — create content (auth + multer upload)
- `GET /api/content` — list content (public, optional auth for guest limits)
- `GET /api/content/:id` — get single content
- `DELETE /api/content/:id` — delete content (auth required)
- `GET /api/boards/ping` — stub
- `GET /api/likes/ping` — stub

## Current Phase

Phase 1 Complete — Auth system fully wired, core CRUD operational

## Next Tasks

1. Board/Collection CRUD implementation
2. Like/unlike functionality
3. Admin dashboard
4. User profile page
5. Registration UI
6. Guest browsing limits

## Daily Progress Log

### 2026-07-22
- Wired AuthProvider into main.jsx (was orphaned)
- Updated LoginPage and OAuthSuccess to use AuthContext.login() instead of direct localStorage
- Wrapped protected routes with ProtectedRoute in App.jsx
- Integrated UserMenu into Navbar (replaced hardcoded avatar)
- Removed duplicate auth guards from Dashboard and AddPromptPage
- Added catch-all route in App.jsx
- Verified clean build (vite build passes)

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
