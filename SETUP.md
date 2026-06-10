# NeedFeed Setup Guide

## 1. Supabase

1. Go to [supabase.com](https://supabase.com) and create a free project
2. Once created, go to **Settings → API** and copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` secret key → `SUPABASE_SERVICE_ROLE_KEY`
3. Go to **SQL Editor** and run the contents of `supabase/schema.sql`

## 2. Stripe

1. Go to [stripe.com](https://stripe.com) and create a free account
2. In the Dashboard, go to **Developers → API Keys** and copy:
   - Publishable key → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - Secret key → `STRIPE_SECRET_KEY`
3. For webhooks (after deploying): **Developers → Webhooks → Add endpoint**
   - URL: `https://your-domain.com/api/stripe/webhook`
   - Events: `checkout.session.completed`
   - Copy the signing secret → `STRIPE_WEBHOOK_SECRET`

## 3. Resend (email)

1. Go to [resend.com](https://resend.com) and create a free account
2. Create an API key → `RESEND_API_KEY`

## 4. Fill in .env.local

Edit `.env.local` with all the values above.

## 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 6. Deploy to Vercel

```bash
npx vercel
```

Or connect your GitHub repo at [vercel.com](https://vercel.com) and add the env vars in the Vercel dashboard.
