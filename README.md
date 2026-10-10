# Storefronts NG

A storefront builder for Nigerian small businesses selling on Instagram and WhatsApp. Merchants sign up, set up a store, add products, and get a live public storefront in minutes. Buyers can browse and check out with no account required.

## Overview

Storefronts NG lets a small business owner turn an Instagram or WhatsApp catalogue into a real online store. Merchants manage products, orders, and branding from a dashboard; customers shop on a public storefront page and pay by card, bank transfer, USSD, or cash on delivery.

## Features

**For merchants**
- Guided onboarding wizard — store name, category, appearance, and bank details in a few steps
- Product catalogue with variants (size, color, etc.) and image uploads
- Order management with status tracking and email notifications
- Dashboard overview with revenue chart and recent activity
- Store settings for branding, hero style, payment setup, and custom slug

**For customers**
- Public storefront with product browsing, filtering, and a shopping cart
- Checkout with Paystack (card, transfer, USSD) or cash on delivery
- Order tracking by reference number, no account needed

**Platform**
- Admin dashboard for merchant oversight, order monitoring, and payment settlements
- SEO-friendly marketing pages with sitemap, robots.txt, and Open Graph image generation

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org) (App Router) with TypeScript
- **Styling:** Tailwind CSS, shadcn/ui, Radix UI primitives, Framer Motion
- **Auth:** Clerk
- **Database:** Prisma ORM
- **Payments:** Paystack
- **Images:** Cloudinary
- **Email:** Resend, React Email
- **State/data:** Zustand, TanStack Query, React Hook Form, Zod
- **Charts:** Recharts

## Getting Started

### Prerequisites

- Node.js 20+
- A PostgreSQL (or compatible) database for Prisma
- API keys for Clerk, Paystack, Cloudinary, and Resend

### Installation

```bash
git clone https://github.com/<your-username>/storefronts-ng.git
cd storefronts-ng
npm install
```

### Environment variables

Create a `.env` file in the project root with the following:

```bash
# Database
DATABASE_URL=

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Paystack
PAYSTACK_SECRET_KEY=
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Resend
RESEND_API_KEY=
```

### Database setup

```bash
npx prisma generate
npx prisma db push
```

### Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Available Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Generate the Prisma client and build for production |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run the TypeScript compiler without emitting output |

## Project Structure

```
app/
  (admin)/        Admin dashboard (merchants, orders, payments)
  (dashboard)/    Merchant dashboard (products, orders, settings, onboarding)
  api/            API routes (products, orders, stores, payments, webhooks)
  store/[slug]/   Public storefront pages
  track/          Order tracking by reference
components/       UI components grouped by feature area
emails/           Transactional email templates
hooks/            Shared React hooks
lib/              Core utilities, auth, payments, and data access
prisma/           Database schema
store/            Client-side state (cart, UI)
types/            Shared TypeScript types
```

## Screenshots

_Add screenshots of the landing page, merchant dashboard, and storefront here._

## License

All rights reserved.
