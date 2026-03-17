# 🎯 Missed Opportunity Detector

A production-ready SaaS app where users discover **internships, hackathons, and jobs** — get personalized **Telegram + email alerts**, and add opportunities to **Google Calendar**.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), Tailwind CSS, Clerk Auth |
| Backend | Node.js, Express, MongoDB (Mongoose) |
| Auth | Clerk |
| Automation | n8n (self-hosted) |
| Deploy | Vercel (frontend), Render (backend + n8n) |

---

## Project Structure

```
CampusConcierge/
├── backend/                  # Express API
│   ├── config/connectDb.js   # MongoDB connection
│   ├── middleware/auth.js     # Clerk JWT + API secret middlewares
│   ├── models/               # User, Opportunity, SavedOpportunity
│   ├── routes/               # user, opportunities, saved, calendar, sync, googleAuth
│   ├── utils/crypto.js       # AES token encryption
│   ├── server.js             # Entry point
│   ├── .env.example          # Required environment variables
│   └── .env                  # Your actual secrets (gitignored)
│
├── frontend/                 # Next.js 14 app
│   ├── app/
│   │   ├── sign-in/          # Clerk sign-in
│   │   ├── sign-up/          # Clerk sign-up
│   │   ├── onboarding/       # 3-step setup wizard
│   │   ├── dashboard/        # Opportunity feed
│   │   └── saved/            # Bookmarked opportunities
│   ├── components/
│   │   └── OpportunityCard.tsx
│   ├── lib/api.ts            # Typed API client (auto-attaches JWT)
│   ├── middleware.ts          # Route protection
│   └── .env.local            # Your frontend secrets (gitignored)
│
├── n8n/                      # Importable workflow JSONs
│   ├── workflow1_scraper.json
│   ├── workflow2_alerts.json
│   ├── workflow3_telegram_bot.json
│   └── workflow4_calendar_webhook.json
│
├── SETUP.md                  # Google OAuth, Telegram bot, SMTP setup
└── DEPLOYMENT.md             # Vercel + Render deployment guide
```

---

## Quick Start (Local Dev)

```bash
# 1. Backend
cd backend
npm install
cp .env.example .env          # Fill in your values
node server.js                 # Runs on :8181

# 2. Frontend
cd frontend
npm install
cp .env.example .env.local    # Fill in your values
npm run dev                    # Runs on :3000
```

---

## Key Features

### 🔐 Auth (Clerk)
- Sign up → auto-redirected to `/onboarding`
- All dashboard routes protected via Clerk middleware

### 🧭 Onboarding (3 steps)
1. Pick **interests** (AI, Web Dev, etc.) + **opportunity types**
2. Connect **email** + **Telegram Chat ID**
3. **Connect Google Calendar** via OAuth

### 📋 Dashboard
- Personalized feed filtered by your preferences
- **Urgency indicators**: 🔴 <2 days · 🟡 <7 days · 🟢 otherwise
- **Save** and **Add to Calendar** on every card
- **Sync Now** button to manually trigger the scraper

### 🤖 n8n Automations
- **Scraper**: Pulls new opportunities every 6 hours from Devpost, Unstop, Internshala
- **Daily Alerts**: Sends Telegram message + HTML email for opportunities expiring within 3 days
- **Telegram Bot**: `/add_to_calendar <opportunityId>` → creates Google Calendar event instantly
- **Calendar Webhook**: Creates Google Calendar events when triggered from the UI

---

## Security
- Google OAuth tokens **AES-encrypted** before storing in MongoDB
- Internal n8n routes protected by a shared `INTERNAL_API_SECRET`
- Tokens are **never sent to the browser** — only decrypted server-side

---

## Setup & Deployment

- 📖 **[SETUP.md](./SETUP.md)** — Google OAuth, Telegram, SMTP step-by-step
- 🚀 **[DEPLOYMENT.md](./DEPLOYMENT.md)** — Vercel + Render deployment guide
