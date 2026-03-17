# Setup Guide — Missed Opportunity Detector

## 1. Google OAuth2 (Calendar Integration)

### Create Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (or select existing)
3. **APIs & Services → Enable APIs** → enable **Google Calendar API**
4. **APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID**
   - Application type: **Web application**
   - Authorized redirect URIs:
     - `http://localhost:8181/api/auth/google/callback` (local)
     - `https://your-backend.onrender.com/api/auth/google/callback` (production)
5. Copy **Client ID** and **Client Secret**

### Fill in Backend .env
```
GOOGLE_CLIENT_ID=xxxxxxxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxx
GOOGLE_REDIRECT_URI=http://localhost:8181/api/auth/google/callback
```

> Users connect Google Calendar from the `/onboarding` page → backend handles the OAuth flow → tokens stored encrypted in MongoDB.

---

## 2. Telegram Bot Setup

### Create a Bot
1. Open Telegram → search **@BotFather** → `/newbot`
2. Follow prompts → you'll receive a **bot token** (e.g., `7123456789:AAHxxxxxx`)
3. Set a webhook so n8n receives messages:
   ```
   https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://your-n8n.onrender.com/webhook/telegram
   ```
4. During onboarding, users message **@userinfobot** to get their **Chat ID**

### n8n Configuration
- In n8n: **Credentials → Add Credential → Telegram**
- Paste the bot token

### Usage
Users send `/add_to_calendar <opportunityId>` to your bot (where `opportunityId` is the MongoDB `_id` shown in the app).

---

## 3. SMTP Email Setup (Gmail)

### Option A: Gmail App Password (easiest)
1. Your Google account → **Security → 2-Step Verification** (must be on)
2. **Security → App Passwords → Generate**
3. Select "Mail" + your device → copy the 16-char password

### n8n SMTP Credential
- In n8n: **Credentials → Add Credential → SMTP**
  - Host: `smtp.gmail.com`
  - Port: `465`
  - Security: `SSL/TLS`
  - User: `your@gmail.com`
  - Password: your 16-char App Password

### Option B: SendGrid
- Sign up at sendgrid.com (free tier: 100 emails/day)
- Create an API key → use as SMTP password
  - Host: `smtp.sendgrid.net` | Port: `587` | User: `apikey`

### Backend .env (optional)
```
SMTP_FROM_EMAIL=alerts@yourdomain.com
```

---

## 4. n8n Cloud Setup (No Env Vars Needed)

I have optimized the JSON workflows for **n8n Cloud**. You do NOT need to set system environment variables. 

Instead, once you import a workflow:
1.  Look for the first node named **"Cloud Config"**.
2.  Double-click it.
3.  Update the **Value** fields for:
    - `BACKEND_URL`: Your Render backend URL.
    - `INTERNAL_API_SECRET`: The secret from your backend `.env`.
    - `SMTP_FROM_EMAIL` (in Workflow 2): Your alert sender email.
4.  n8n Cloud will propagate these values to all other nodes automatically.

---

## 5. Generating Secure Secrets

```bash
# INTERNAL_API_SECRET
openssl rand -hex 32

# ENCRYPTION_KEY
openssl rand -hex 32
```
