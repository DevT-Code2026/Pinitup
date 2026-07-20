# Togepe — Phase 1

Content platform skeleton — accounts, admin-managed content, and the core collection/engagement loop.

## Structure

- `client/` — React + Vite frontend
- `server/` — Node + Express backend, MongoDB via Mongoose

## Local Setup

### Server
```
cd server
npm install
cp .env.example .env   # fill in MONGO_URI and JWT_SECRET
npm run dev
```

### Client
```
cd client
npm install
cp .env.example .env   # fill in VITE_API_URL
npm run dev
```

## Deployment

- Frontend → Vercel (auto-deploy from `main`)
- Backend → Render (auto-deploy from `main`)
- Database → MongoDB Atlas
- Media → ImageKit / Cloudinary
