# Deployment Guide — Missed Opportunity Detector

## Architecture Overview
```
Vercel (Frontend)  ←→  Render (Backend)  ←→  Render (n8n)
                              ↕
                        MongoDB Atlas
```

---

## Step 1: MongoDB Atlas

1. [https://cloud.mongodb.com](https://cloud.mongodb.com) → Create free cluster
2. **Database Access** → Add user with read/write permissions
3. **Network Access** → Add `0.0.0.0/0` (allow all IPs for Render)
4. **Connect → Drivers** → Copy connection string
5. Replace `<password>` in the URI with your DB user password

---

## Step 2: Deploy Backend to Render

1. Go to [https://render.com](https://render.com) → **New → Web Service**
2. Connect your GitHub repo, select the `backend` folder
3. Settings:
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Node version**: 18+
4. **Environment Variables** — add all from `backend/.env.example`:
   ```
   MONGO_URI=mongodb+srv://...
   CLERK_SECRET_KEY=sk_live_...
   INTERNAL_API_SECRET=<your-secret>
   ENCRYPTION_KEY=<your-key>
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   GOOGLE_REDIRECT_URI=https://<your-backend>.onrender.com/api/auth/google/callback
   FRONTEND_URL=https://<your-app>.vercel.app
   PORT=10000
   ```
5. Deploy → note your backend URL

---

## Step 3: Setup n8n Cloud

1.  Log in to your n8n Cloud account.
2.  **Import Workflows**: Open your dashboard -> **Workflows** -> **Add Workflow** -> **Import from file**.
3.  Import all 4 files from the `/n8n` folder.
4.  **Configure Credentials**:
    - **Telegram**: Create a "Telegram API" credential with your bot token.
    - **SMTP**: Create an "SMTP" credential (use App Password for Gmail).
    - **Google Calendar**: Create a "Google Calendar OAuth2" credential using your Google Client ID/Secret.
5.  **Set Config**: In each workflow, open the **"Cloud Config"** node and paste your `BACKEND_URL` and `INTERNAL_API_SECRET`.
6.  Toggle workflows to **Active**.

---

## Step 4: Deploy Frontend to Vercel

1. Go to [https://vercel.com](https://vercel.com) → **New Project** → import repo
2. **Root Directory**: `frontend`
3. **Framework Preset**: Next.js
4. **Environment Variables**:
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
   CLERK_SECRET_KEY=sk_live_...
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
   NEXT_PUBLIC_API_URL=https://<your-backend>.onrender.com
   ```
5. Deploy → note your Vercel URL

---

## Step 5: Update Clerk Dashboard

1. Go to [https://dashboard.clerk.com](https://dashboard.clerk.com)
2. **Allowlist** → add your Vercel URL as allowed origin
3. **Allowed redirect URLs** → add `https://<your-app>.vercel.app`

---

## Step 6: Update Backend FRONTEND_URL

In Render backend env vars, update:
```
FRONTEND_URL=https://<your-app>.vercel.app
```
And update Google Cloud Console redirect URIs to include the production callback.

---

## Local Development

```bash
# Terminal 1 — Backend
cd backend
npm install
cp .env.example .env   # fill in your values
node server.js

# Terminal 2 — Frontend
cd frontend
npm install
cp .env.example .env.local   # fill in your values
npm run dev
```

Frontend runs on `http://localhost:3000`, backend on `http://localhost:8181`.
