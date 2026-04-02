# Cat Nanny — Production Deployment Guide

This guide walks you through deploying Cat Nanny to production using **Railway** (recommended) or **Render**.

---

## Architecture

- **Frontend**: Vite + React → deploys to Vercel (or Render Static Site)
- **Backend**: Express + Prisma → deploys to Railway/Render (Web Service)
- **Database**: PostgreSQL on Railway/Render

---

## Step 1 — Prepare Your GitHub Repo

Push your `cat-nanny/` project to GitHub. The repo should look like:

```
cat-nanny/
├── client/          # Vite + React frontend
├── server/          # Express + Prisma backend
├── DEPLOY.md        # This file
└── SPEC.md
```

---

## Step 2 — Deploy Backend (Railway) ✨ Recommended

### 2.1 Create a Railway Account

Go to [railway.app](https://railway.app) and sign up with GitHub.

### 2.2 Create a New Project

1. Click **New Project** → **Deploy from GitHub repo**
2. Select your `cat-nanny` repo
3. Choose the **backend** folder — in Railway, set the **root directory** to `server`

### 2.3 Add PostgreSQL Database

1. In your Railway project, click **Add Plugin** → **PostgreSQL**
2. Railway will automatically create a `DATABASE_URL` environment variable for you
3. Copy the value — you'll use it in the next step

### 2.4 Set Environment Variables

In your Railway project **Variables** section, add the following (replace placeholders):

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | `3000` |
| `DATABASE_URL` | (from PostgreSQL plugin — already set) |
| `JWT_SECRET` | A strong random string, min 32 chars (e.g. `openssl rand -hex 32`) |
| `JWT_EXPIRES_IN` | `15m` |
| `REFRESH_TOKEN_EXPIRES_IN` | `7d` |
| `CORS_ORIGIN` | Your Vercel frontend URL (e.g. `https://your-app.vercel.app`) |

### 2.5 Configure Build Command & Start Command

In Railway **Settings** → **Deploy**:

- **Build Command**: `npm install && npx prisma migrate deploy && npm start`
- **Start Command**: Leave blank (the build command handles it via the Procfile)
- **Root Directory**: `server`

Or create a `Procfile` in `server/` (already included):

```
web: npx prisma migrate deploy && npm start
```

### 2.6 Your Backend URL

After deploying, Railway will give you a URL like:
```
https://cat-nanny-backend.up.railway.app
```

Copy this — you'll need it for the frontend.

---

## Alternative: Deploy Backend on Render

1. Create a **Web Service** on [render.com](https://render.com)
2. Connect your GitHub repo
3. Set:
   - **Root Directory**: `server`
   - **Build Command**: `npm install && npx prisma migrate deploy && npm start`
   - **Start Command**: (blank)
4. Add a **PostgreSQL** managed database (the `DATABASE_URL` will be auto-populated)
5. Add the remaining environment variables from the table above

---

## Step 3 — Deploy Frontend (Vercel)

### 3.1 Create a Vercel Account

Go to [vercel.com](https://vercel.com) and sign up with GitHub.

### 3.2 Import Your Project

1. Click **Add New** → **Project**
2. Import your `cat-nanny` repo
3. Set **Framework Preset** to `Vite` (or `Other`)
4. Set the **Root Directory** to `client`

### 3.3 Configure Build Settings

| Setting | Value |
|---|---|
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |

### 3.4 Set Environment Variable

Add one environment variable in Vercel:

| Variable | Value |
|---|---|
| `VITE_API_URL` | Your backend URL from Railway/Render (e.g. `https://cat-nanny-backend.up.railway.app`) |

> ⚠️ Make sure you add this **before** deploying. If you deploy first, do a **re-deploy** after adding the variable.

### 3.5 Your Frontend URL

Vercel will give you a URL like:
```
https://your-app.vercel.app
```

---

## Step 4 — Final Configuration

Once both services are live, go back to your Railway/Render backend settings and make sure:

```
CORS_ORIGIN=https://your-app.vercel.app
```

points to your actual Vercel frontend URL.

---

## Step 5 — Verify

- **Backend health check**: `https://your-backend.up.railway.app/health`
- **Frontend**: Visit your Vercel URL and try logging in

---

## Environment Variable Summary

### Server (`server/.env.production`)

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://...
JWT_SECRET=your-32-char-min-secret
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
CORS_ORIGIN=https://your-frontend.vercel.app
```

### Client (Vercel environment variables)

```env
VITE_API_URL=https://your-backend.up.railway.app
```

---

## Troubleshooting

### CORS errors
Make sure `CORS_ORIGIN` in your backend matches your frontend's Vercel URL exactly (no trailing slash).

### Database connection errors
Verify `DATABASE_URL` is correctly set in Railway/Render and the PostgreSQL instance is in the same region.

### Prisma migration fails on Railway
The `npm start` script in `server/package.json` should be `node src/index.js`. The Procfile runs migrations before starting. Make sure `npx prisma migrate deploy` succeeds before the app starts.

### Auth/Token issues
Ensure `JWT_SECRET` is consistent. If users can't log in after a redeploy, the JWT secret may have changed.
