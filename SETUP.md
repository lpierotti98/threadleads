# ThreadLeads — Setup Guide

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up / log in
2. Click **New Project**, pick a name and password, choose a region close to you
3. Wait for the project to finish provisioning (about 1 minute)
4. Go to **Settings → API** in the left sidebar
5. Copy these values into your `.env.local` file:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`
6. Go to **SQL Editor** in the left sidebar
7. Paste the contents of `supabase/schema.sql` and click **Run**
   - This creates all tables, indexes, and security policies

## 2. Get an Anthropic API Key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up or log in
3. Go to **API Keys** and click **Create Key**
4. Copy the key → `ANTHROPIC_API_KEY` in your `.env.local`

## 3. Connect Stripe

1. Log in to [dashboard.stripe.com](https://dashboard.stripe.com)
2. Make sure you're in **Test mode** (toggle in the top right)
3. Go to **Developers → API Keys**:
   - **Publishable key** → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - **Secret key** → `STRIPE_SECRET_KEY`
4. Go to **Developers → Webhooks** → **Add endpoint**:
   - Endpoint URL: `https://your-domain.com/api/webhooks/stripe`
     (for local testing use `stripe listen --forward-to localhost:3000/api/webhooks/stripe`)
   - Events to listen for: `checkout.session.completed`, `customer.subscription.deleted`, `customer.subscription.updated`
   - Copy the **Signing secret** → `STRIPE_WEBHOOK_SECRET`

## 4. Run Locally

```bash
# 1. Clone the repo
git clone <your-repo-url>
cd threadleads

# 2. Install dependencies
npm install

# 3. Create your env file
cp .env.local.example .env.local
# Then fill in all the values from steps 1-3

# 4. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 5. Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and click **New Project**
3. Import your GitHub repository
4. In **Environment Variables**, add all the variables from your `.env.local`
   - Change `NEXT_PUBLIC_APP_URL` to your Vercel domain (e.g. `https://threadleads.vercel.app`)
5. Click **Deploy**
6. After deployment, update your Stripe webhook URL to your new Vercel domain

## Quick Start After Setup

1. Sign up at `/signup`
2. Add keywords at `/settings/keywords` (e.g. "AI customer support tool")
3. Click **Scan Now** on the dashboard
4. Review scored threads and generate replies
